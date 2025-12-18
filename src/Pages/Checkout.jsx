// src/pages/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "/hooks/useAuth";

const isValidCartItem = (item) =>
  item &&
  typeof item._id === "string" &&
  typeof item.quantity === "number" &&
  item.quantity > 0;

const Checkout = () => {
  const navigate = useNavigate();
  const { user, getAuthHeader, logout } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "COD",
  });

  /* ---------- Load cart ---------- */
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("cart")) || [];
    const clean = raw.filter(isValidCartItem);

    if (!clean.length) {
      navigate("/cart");
      return;
    }

    setCart(clean);

    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || "",
        phone: user.phone || "",
      }));
    }
  }, [user, navigate]);

  /* ---------- Estimated total (UI only) ---------- */
  const estimatedTotal = useMemo(
    () => cart.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0),
    [cart]
  );

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ---------- Validation ---------- */
  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      return "Enter valid 10-digit phone number";
    if (!form.address.trim()) return "Address is required";
    if (!form.city.trim()) return "City is required";
    if (!/^\d{6}$/.test(form.pincode))
      return "Enter valid 6-digit pincode";
    return "";
  };

  /* ---------- Place order ---------- */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const products = cart.map((i) => ({
      product: i._id,
      quantity: i.quantity,
    }));

    setLoading(true);
    try {
      const res = await API.post(
        "/api/orders/postorders", // ✅ RESTFUL
        {
          products,
          address: {
            name: form.name,
            phone: form.phone,
            line1: form.address,
            city: form.city,
            pincode: form.pincode,
          },
        },
        { headers: getAuthHeader() }
      );

      const order = res.data?.data;
      if (!order?._id) throw new Error("Order creation failed");

      if (form.paymentMethod === "COD") {
        localStorage.removeItem("cart");
        navigate("/orders");
        return;
      }

      await startRazorpay(order._id);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };
  console.log("AUTH HEADER:", getAuthHeader());


  /* ---------- Razorpay ---------- */
  const startRazorpay = async (orderId) => {
    try {
      if (!window.Razorpay) {
        setError("Payment service unavailable. Please try again later.");
        return;
      }

      const rzRes = await API.post(
        "/api/payments/create-order",
        { orderId },
        { headers: getAuthHeader() }
      );

      const rpOrder = rzRes.data?.razorpayOrder;
      if (!rpOrder?.id) throw new Error("Payment init failed");

      const options = {
        key: import.meta.env.VITE_RZ_KEY_ID,
        amount: rpOrder.amount,
        currency: "INR",
        name: "Swadbest",
        order_id: rpOrder.id,
        handler: async (response) => {
          await API.post(
            "/api/payments/verify",
            response,
            { headers: getAuthHeader() }
          );
          localStorage.removeItem("cart");
          navigate("/orders");
        },
        modal: {
          ondismiss: () => {
            setError(
              "Payment cancelled. Your order is saved — you can retry from Orders."
            );
          },
        },
        prefill: {
          name: form.name,
          contact: form.phone,
        },
        theme: { color: "#FB923C" },
      };

      new window.Razorpay(options).open();
    } catch {
      setError("Unable to start online payment");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          Checkout
        </h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="grid md:grid-cols-2 gap-8">
          {/* FORM */}
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <input disabled={loading} name="name" value={form.name} onChange={onChange} className="w-full border p-2 rounded" placeholder="Full name" />
            <input disabled={loading} name="phone" value={form.phone} onChange={onChange} className="w-full border p-2 rounded" placeholder="Phone number" />
            <textarea disabled={loading} name="address" value={form.address} onChange={onChange} className="w-full border p-2 rounded" placeholder="Address" />
            <input disabled={loading} name="city" value={form.city} onChange={onChange} className="w-full border p-2 rounded" placeholder="City" />
            <input disabled={loading} name="pincode" value={form.pincode} onChange={onChange} className="w-full border p-2 rounded" placeholder="Pincode" />

            <div className="space-y-2">
              <label className="flex gap-2">
                <input disabled={loading} type="radio" name="paymentMethod" value="COD" checked={form.paymentMethod === "COD"} onChange={onChange} />
                Cash on Delivery
              </label>
              <label className="flex gap-2">
                <input disabled={loading} type="radio" name="paymentMethod" value="Online" checked={form.paymentMethod === "Online"} onChange={onChange} />
                Online Payment
              </label>
            </div>

            <button disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold">
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>

          {/* SUMMARY */}
          <div className="bg-orange-50 rounded-xl p-5 border">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>

            {cart.map((i) => (
              <div key={i._id} className="flex justify-between text-sm mb-2">
                <span>{i.name} × {i.quantity}</span>
                <span>₹{(i.price || 0) * i.quantity}</span>
              </div>
            ))}

            <div className="border-t pt-3 mt-3 font-bold text-lg">
              Estimated Total: ₹{estimatedTotal}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Final amount calculated securely on server
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Checkout;
