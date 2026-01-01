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
      const res = await API.get("/api/address/getadd", { headers: getAuthHeader() });
      if (res.data.success) {
        setSavedAddresses(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedAddress(res.data.data[0]._id);
          setShowForm(false);
        } else {
          setShowForm(true);
        }
      }
    } catch {
      toast.error("Failed to fetch addresses");
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  /* ---------------- Price Preview ---------------- */
  const updatePricePreview = useCallback(async () => {
    if (!selectedAddress || cart.length === 0) return;

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
        { headers: getAuthHeader() }
      );

      if (res.data.success) {
        setPricing(res.data);
      }
    } catch {
      toast.error("Failed to calculate pricing");
    }
  }, [getAuthHeader ,selectedAddress, form.paymentMethod, cart]);

  useEffect(() => {
    updatePricePreview();
  }, [updatePricePreview]);

  /* ---------------- Save Address ---------------- */
  const saveAddress = async () => {
    const required = ["name", "phone", "house", "street", "pincode", "city", "state"];
    for (const r of required) {
      if (!form[r]) return toast.error(`Missing ${r}`);
    }

    try {
      setLoading(true);

      const res = await API.post("/api/address/add", form, {
        headers: getAuthHeader(),
      });

      if (!res.data.success) return toast.error(res.data.message);

      toast.success("Address added");
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

    if (!selectedAddress) return toast.error("Select address");
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
        { headers: getAuthHeader() }
      );

      const order = res.data?.data;

      if (form.paymentMethod === "COD") {
        toast.success("Order placed");
        localStorage.removeItem("cart");
        return navigate("/orders");
      }

      await startRazorpay(order._id);
    } catch (err) {
      toast.error("Order failed",err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Razorpay ---------------- */
  const startRazorpay = async (orderId) => {
    const rzRes = await API.post(
      "/api/payments/create-order",
      { orderId },
      { headers: getAuthHeader() }
    );

    const rp = rzRes.data.razorpayOrder;

    new window.Razorpay({
      key: import.meta.env.VITE_RZ_KEY_ID,
      amount: rp.amount,
      currency: "INR",
      name: "Swadbest",
      order_id: rp.id,
      handler: async () => {
        toast.success("Payment successful");
        localStorage.removeItem("cart");
        navigate("/orders");
      },
    }).open();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">Checkout</h2>

        <form onSubmit={handlePlaceOrder} className="grid md:grid-cols-2 gap-8">

          {/* LEFT: ADDRESS */}
          <div className="space-y-4">
            {/* List of saved addresses */}
            {savedAddresses.length > 0 && !showForm && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Choose Delivery Address</h3>

                {savedAddresses.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => setSelectedAddress(a._id)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedAddress === a._id
                        ? "border-orange-500 bg-orange-100"
                        : "border-gray-300"
                    }`}
                  >
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-sm">{a.house}, {a.street}</p>
                    <p className="text-sm">{a.city} - {a.pincode}</p>
                    <p className="text-xs text-gray-500">{a.state}</p>
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

            {/* Address Form */}
            {showForm && (
              <div className="space-y-3 p-4 border rounded-xl bg-gray-50">
                {["name", "phone", "house", "street", "landmark", "pincode", "city", "state"].map((f) => (
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
                  {loading ? "Saving..." : "Save Address"}
                </button>
              </div>
            )}

            {/* Payment Method */}
            <div className="mt-4">
              <h3 className="font-semibold text-lg">Payment Method</h3>

              <label className="flex items-center gap-2 mt-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online"
                  checked={form.paymentMethod === "Online"}
                  onChange={onChange}
                />
                Online Payment
              </label>

              {user?.codEligible ? (
                <label className="flex items-center gap-2 mt-1">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={form.paymentMethod === "COD"}
                    onChange={onChange}
                  />
                  Cash on Delivery
                </label>
              ) : (
                <p className="text-xs text-gray-500 mt-1">COD unlocks after 2 deliveries</p>
              )}
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="bg-orange-50 p-5 rounded-xl border shadow-md">
            <h3 className="font-bold text-lg mb-3">Order Summary</h3>

            {/* Cart Items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm hover:scale-[1.02] transition"
                >
                  <img src={item.image} className="w-12 h-12 rounded-md border" />
                  <div className="flex-1 ml-3">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="text-sm mt-4 space-y-1 border-t pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{pricing.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (12%)</span>
                <span>₹{pricing.tax}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>₹{pricing.deliveryCharge}</span>
              </div>
              {form.paymentMethod === "COD" && (
                <div className="flex justify-between">
                  <span>COD Charge</span>
                  <span>₹{pricing.codCharge}</span>
                </div>
              )}

              <div className="border-t pt-3 mt-3 font-bold text-lg flex justify-between">
                <span>Total Payable</span>
                <span>₹{pricing.totalAmount}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-5 bg-orange-500 text-white py-3 rounded-lg"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
