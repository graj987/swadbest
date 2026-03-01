// src/pages/Checkout.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [pricing, setPricing] = useState({
    subtotal: 0,
    tax: 0,
    deliveryCharge: 0,
    codCharge: 0,
    totalAmount: 0,
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    house: "",
    street: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    paymentMethod: "",
  });

  /* ---------------- Load Cart ---------------- */
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await API.get("/api/cart");

        const items = res.data?.items || [];

        if (!items.length) {
          navigate("/cart");
          return;
        }

        setCart(items);
      } catch {
        toast.error("Failed to load cart");
      }

      setForm((f) => ({
        ...f,
        name: user?.name || "",
        phone: user?.phone || "",
      }));
    };

    loadCart();
  }, [navigate, user]);

  /* ---------------- Input Change ---------------- */
  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ---------------- Fetch Addresses ---------------- */
  const fetchSaved = useCallback(async () => {
    try {
      const res = await API.get("/api/address/getadd");

      if (res.data.success) {
        setSavedAddresses(res.data.data);
        if (res.data.data.length) {
          setSelectedAddress(res.data.data[0]._id);
          setShowForm(false);
        } else {
          setShowForm(true);
        }
      }
    } catch {
      toast.error("Failed to load saved addresses");
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const buildProductsPayload = useCallback(() => {
    if (!cart.length) throw new Error("Cart empty");

    return cart.map((item) => {
      if (!item.product?._id) throw new Error("Invalid product");

      const variantIndex =
        item.variantIndex ??
        item.product.variants?.findIndex(
          (v) => v.weight === item.variant?.weight,
        );

      if (variantIndex < 0) throw new Error("Variant not found");

      if (!item.quantity || item.quantity <= 0)
        throw new Error("Invalid quantity");

      return {
        product: item.product._id,
        variantIndex,
        quantity: item.quantity,
      };
    });
  }, [cart]);

  /* ---------------- Price Preview ---------------- */
  const updatePricePreview = useCallback(async () => {
    if (!selectedAddress || !form.paymentMethod || !cart.length) return;

    try {
      // ✅ single source of truth
      const products = buildProductsPayload();

      console.log("PRICE PREVIEW DATA:", products);

      const res = await API.post("/api/orders/price-preview", {
        products,
        addressId: selectedAddress,
        paymentMethod: form.paymentMethod,
      });

      if (res.data?.success && res.data?.data) {
        setPricing(res.data.data);
      } else {
        throw new Error("Invalid pricing response");
      }
    } catch (err) {
      console.error("PRICE PREVIEW ERROR:", err);
      setPricing({
        subtotal: 0,
        tax: 0,
        deliveryCharge: 0,
        codCharge: 0,
        totalAmount: 0,
      });
      console.error("SERVER:", err.response?.data);
    }
  }, [cart, selectedAddress, form.paymentMethod, buildProductsPayload]);

  useEffect(() => {
    updatePricePreview();
  }, [updatePricePreview]);

  /* ---------------- Auto Detect Address ---------------- */
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported");
      return;
    }

    toast.info("Detecting your location…");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          const addr = data.address || {};

          setForm((f) => ({
            ...f,
            city: addr.city || addr.town || "",
            state: addr.state || "",
            pincode: addr.postcode || "",
          }));

          toast.success("Location detected. Please verify address.");
        } catch {
          toast.error("Unable to fetch address");
        }
      },
      () => toast.error("Location permission denied"),
    );
  };

  /* ---------------- Save Address ---------------- */
  const saveAddress = async () => {
    const required = [
      "name",
      "phone",
      "house",
      "street",
      "pincode",
      "city",
      "state",
    ];
    for (const r of required) {
      if (!form[r]) return toast.error(`Missing ${r}`);
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      return toast.error("Invalid pincode");
    }

    try {
      setLoading(true);
      const res = await API.post("/api/address/add", form);

      if (!res.data.success) return toast.error(res.data.message);
      toast.success("Address saved");
      await fetchSaved();
    } catch {
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Build Products Payload ---------------- */

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!selectedAddress) return toast.error("Select delivery address");

    if (!form.paymentMethod) return toast.error("Select payment method");

    try {
      setLoading(true);

      /* ---------- BUILD PRODUCTS PAYLOAD ---------- */
      if (!cart.length) throw new Error("Cart empty");

      const products = buildProductsPayload();

      console.log("ORDER DATA:", {
        products,
        addressId: selectedAddress,
        paymentMethod: form.paymentMethod,
      });

      /* =======================================================
       COD FLOW
    ======================================================= */
      if (form.paymentMethod === "COD") {
        const res = await API.post("/api/orders/postorders", {
          products,
          addressId: selectedAddress,
          paymentMethod: "COD",
        });

        if (!res.data?.success)
          throw new Error(res.data?.message || "Order failed");

        toast.success("Order placed successfully");
        localStorage.removeItem("cart");
        navigate("/orders");
        return;
      }

      /* =======================================================
       ONLINE PAYMENT FLOW (FIXED)
    ======================================================= */

      // ✅ STEP 1: Create order in database FIRST
      const orderRes = await API.post("/api/orders/postorders", {
        products,
        addressId: selectedAddress,
        paymentMethod: "Online",
      });

      if (!orderRes.data?.success) throw new Error("Order creation failed");

      const orderId =
        orderRes.data?.order?._id ||
        orderRes.data?.orderId ||
        orderRes.data?._id ||
        orderRes.data?.data?._id;

      if (!orderId) {
        throw new Error("Order ID not returned from server");
      }

      // ✅ STEP 2: Create Razorpay order USING orderId
      const paymentRes = await API.post("/api/payments/create-order", {
        orderId,
      });

      if (!paymentRes.data?.ok || !paymentRes.data?.razorpayOrder)
        throw new Error("Failed to initiate payment");

      const razorOrder = paymentRes.data.razorpayOrder;

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RZ_KEY_ID,
        amount: razorOrder.amount,
        currency: "INR",
        name: "Swadbest",
        description: "Secure Payment",
        order_id: razorOrder.id,

        handler: async (response) => {
          try {
            if (!response?.razorpay_payment_id)
              throw new Error("Invalid payment response");

            const verify = await API.post("/api/payments/verify", {
              orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verify.data?.ok) {
              localStorage.removeItem("cart");
              navigate(`/payment-success/${orderId}`);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error("VERIFY ERROR:", err.response?.data);
            navigate("/orders");
          }
        },

        modal: {
          ondismiss: () => toast.error("Payment cancelled"),
        },
      });

      rzp.open();
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed. Try again.");
      });
    } catch (err) {
      console.error("FULL ERROR:", err);
      console.error("SERVER RESPONSE:", err.response?.data);

      toast.error(
        err.response?.data?.message || err.message || "Checkout failed",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          🧾 Secure Checkout
        </h2>

        <form
          onSubmit={handlePlaceOrder}
          className="grid md:grid-cols-2 gap-10"
        >
          {/* LEFT */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">📍 Delivery Address</h3>

            {savedAddresses.length > 0 && !showForm && (
              <div className="space-y-3">
                {savedAddresses.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => setSelectedAddress(a._id)}
                    className={`p-4 rounded-lg border cursor-pointer ${
                      selectedAddress === a._id
                        ? "border-orange-500 bg-orange-100"
                        : "border-gray-300"
                    }`}
                  >
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-sm">
                      {a.house}, {a.street}, {a.city} - {a.pincode}
                    </p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="text-orange-500 font-semibold"
                >
                  + Add New Address
                </button>
              </div>
            )}

            {showForm && (
              <div className="space-y-3 p-4 border rounded-xl bg-gray-50">
                <button
                  type="button"
                  onClick={detectLocation}
                  className="text-sm text-orange-600 font-semibold"
                >
                  📍 Auto-detect location
                </button>

                {[
                  "name",
                  "phone",
                  "house",
                  "street",
                  "landmark",
                  "pincode",
                  "city",
                  "state",
                ].map((f) => (
                  <input
                    key={f}
                    name={f}
                    placeholder={f.toUpperCase()}
                    value={form[f]}
                    onChange={onChange}
                    className="w-full border p-2 rounded"
                  />
                ))}

                <button
                  type="button"
                  onClick={saveAddress}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg"
                >
                  Save Address
                </button>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg">💳 Payment Method</h3>

              <label className="flex gap-2 mt-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online"
                  checked={form.paymentMethod === "Online"}
                  onChange={onChange}
                />
                Online (UPI / Card / Wallet)
              </label>

              <label className="flex gap-2 mt-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={form.paymentMethod === "COD"}
                  onChange={onChange}
                />
                Cash on Delivery
              </label>

              <p className="text-xs text-gray-500 mt-2">
                🔒 100% secure • No card data stored
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-orange-50 p-6 rounded-xl border shadow-md">
            <h3 className="font-bold text-lg mb-3">🛍️ Order Summary</h3>

            <div className="text-sm space-y-2 border-t pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{pricing?.subtotal || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>GST</span>
                <span>₹{pricing.tax}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{pricing.deliveryCharge}</span>
              </div>

              <div className="border-t pt-3 font-bold text-lg flex justify-between">
                <span>Total</span>
                <span>₹{pricing.totalAmount}</span>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                🚚 Estimated delivery in 3–6 days
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Processing Payment..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
