// src/pages/Checkout.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();

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
    const raw = JSON.parse(localStorage.getItem("cart")) || [];
    if (!raw.length) return navigate("/cart");
    setCart(raw);

    setForm((f) => ({
      ...f,
      name: user?.name || "",
      phone: user?.phone || "",
    }));
  }, [navigate, user]);

  /* ---------------- Input Change ---------------- */
  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ---------------- Fetch Addresses ---------------- */
  const fetchSaved = useCallback(async () => {
    try {
      const res = await API.get("/api/address/getadd", {
        headers: getAuthHeader(),
      });

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
  }, [getAuthHeader]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  /* ---------------- Price Preview ---------------- */
  const updatePricePreview = useCallback(async () => {
    if (!selectedAddress || !cart.length) return;

    try {
      const res = await API.post(
        "/api/orders/price-preview",
        {
          products: cart.map((i) => ({
            product: i._id,
            quantity: i.quantity,
          })),
          addressId: selectedAddress,
          paymentMethod: form.paymentMethod,
        },
        { headers: getAuthHeader() },
      );

      if (res.data.success) setPricing(res.data);
    } catch {
      toast.error("Pricing calculation failed");
    }
  }, [getAuthHeader, selectedAddress, form.paymentMethod, cart]);

  useEffect(() => {
    if (selectedAddress && form.paymentMethod) {
      updatePricePreview();
    }
  }, [selectedAddress, form.paymentMethod, updatePricePreview]);

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
      const res = await API.post("/api/address/add", form, {
        headers: getAuthHeader(),
      });

      if (!res.data.success) return toast.error(res.data.message);
      toast.success("Address saved");
      await fetchSaved();
    } catch {
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Place Order ---------------- */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!selectedAddress) return toast.error("Select delivery address");
    if (!form.paymentMethod) return toast.error("Select payment method");

    try {
      setLoading(true);
      const res = await API.post(
        "/api/orders/postorders",
        {
          products: cart.map((i) => ({
            product: i._id,
            quantity: i.quantity,
          })),
          addressId: selectedAddress,
          paymentMethod: form.paymentMethod,
        },
        { headers: getAuthHeader() },
      );

      const order = res.data?.data;

      if (form.paymentMethod === "COD") {
        toast.success("Order placed successfully");
        localStorage.removeItem("cart");
        return navigate("/orders");
      }

      await startRazorpay(order._id);
    } catch {
      toast.error("Order placement failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Razorpay ---------------- */
  const startRazorpay = async (orderId) => {
    const rzRes = await API.post(
      "/api/payments/create-order",
      { orderId },
      { headers: getAuthHeader() },
    );

    const rp = rzRes.data.razorpayOrder;

    new window.Razorpay({
      key: import.meta.env.VITE_RZ_KEY_ID,
      amount: rp.amount,
      currency: "INR",
      name: "Swadbest",
      description: "Secure Payment",
      order_id: rp.id,
      handler: async (response) => {
        await API.post(
          "/api/payments/verify",
          {
            orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          },
          { headers: getAuthHeader() },
        );

        toast.success("Payment verified & order confirmed");
        localStorage.removeItem("cart");
        navigate("/orders");
      },
    }).open();
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
                <span>₹{pricing.subtotal}</span>
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
              {loading ? "Processing…" : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
