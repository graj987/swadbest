// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "COD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    const totalAmount = storedCart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    setTotal(totalAmount);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setFormData((f) => ({ ...f, name: user.name || f.name, phone: user.phone || f.phone }));
  }, []);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const startRazorpayPayment = async (orderId) => {
    try {
      // *** CORRECT PATH: /api/payments/create-order (server mounts at /api/payments) ***
      const rzRes = await API.post("/api/payments/create-order", { orderId });
      const razorOrder = rzRes.data?.razorpayOrder || rzRes.data?.order || rzRes.data;
      if (!razorOrder || !razorOrder.id) throw new Error("Failed to init payment (invalid response)");

      if (!import.meta.env.VITE_RZ_KEY_ID) {
        setError("Payment key not configured.");
        return;
      }
      if (!window?.Razorpay) {
        setError("Razorpay SDK not loaded. Add script to index.html.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RZ_KEY_ID,
        amount: razorOrder.amount,
        currency: razorOrder.currency || "INR",
        name: "Swad Order Payment",
        description: `Order #${orderId}`,
        order_id: razorOrder.id,
        handler: async function (response) {
          try {
            const verifyRes = await API.post("/api/payments/verify", response);
            if (verifyRes.data?.ok) {
              localStorage.removeItem("cart");
              navigate("/orders");
            } else {
              setError("Payment failed or rejected.");
            }
          } catch (verifyErr) {
            console.error("verify error", verifyErr);
            setError("Payment verification failed.");
          }
        },
        prefill: { name: formData.name, contact: formData.phone },
        theme: { color: "#FB923C" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on && rzp.on("payment.failed", (resp) => {
        console.error("razorpay failed", resp);
        setError("Payment failed or cancelled.");
      });
      rzp.open();
    } catch (err) {
      console.error("startRazorpayPayment err:", err);
      setError("Unable to start payment.");
      throw err; // rethrow so caller can handle paying state
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) {
      navigate("/login");
      return;
    }

    const formattedAddress = `${formData.address}, ${formData.city}, ${formData.pincode}`;
    const products = cart.map((item) => ({ product: item._id, quantity: item.quantity }));

    setLoading(true);
    try {
      const res = await API.post("/api/orders", {
        user: user._id,
        products,
        totalAmount: total,
        address: formattedAddress,
      });

      const order = res.data;
      if (!order?._id) throw new Error("Order creation failed");

      if (formData.paymentMethod === "COD") {
        setSuccess("Order placed successfully (COD).");
        localStorage.removeItem("cart");
        setTimeout(() => navigate("/orders"), 1200);
        return;
      }

      // Online payment: start razorpay flow
      await startRazorpayPayment(order._id);
    } catch (err) {
      console.error("handlePlaceOrder err:", err);
      setError(err.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-orange-100">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">Checkout</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}

        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="Full name" />
            <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="Phone" />
            <textarea name="address" value={formData.address} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="Address" />
            <input name="city" value={formData.city} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="City" />
            <input name="pincode" value={formData.pincode} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="Pincode" />
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="COD">Cash on Delivery</option>
              <option value="Online">Online Payment</option>
            </select>
            <button disabled={loading} className="w-full bg-orange-500 text-white py-2 rounded-lg">
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>

          <div className="bg-orange-50 rounded-xl p-5 border">
            <h3 className="font-bold text-lg mb-3">Order Summary</h3>
            {cart.length === 0 ? <p className="text-gray-500">No items in cart.</p> : (
              <>
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between mb-2">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="font-bold text-xl pt-3 border-t mt-3">Total: ₹{total}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
