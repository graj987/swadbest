import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(totalAmount);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Format address and product data to match backend schema
    const formattedAddress = `${formData.address}, ${formData.city}, ${formData.pincode}`;
    const products = cart.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    const orderData = {
      products,
      totalAmount: total,
      address: formattedAddress,
      paymentStatus:
        formData.paymentMethod === "Online" ? "paid" : "pending",
      orderStatus: "preparing",
    };

    setLoading(true);
    try {
      const res = await axios.post(
        "https://swadbackendserver.onrender.com/api/orders",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        setSuccess("✅ Order placed successfully!");
        localStorage.removeItem("cart");
        setTimeout(() => navigate("/orders"), 1500);
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-orange-100">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">Checkout</h2>

        {error && (
          <div className="text-red-500 text-center mb-4 text-sm">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-center mb-4 text-sm font-medium">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Address Form */}
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="e.g., 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                rows="3"
                placeholder="House number, street, landmark"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="number"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="e.g., 560001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Online">Online Payment</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          {/* Right: Order Summary */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 h-fit">
            <h3 className="text-lg font-bold text-gray-700 mb-3">
              Order Summary
            </h3>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm">No items in cart.</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center border-b border-gray-200 pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-700">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-300 flex justify-between font-bold text-gray-700">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
