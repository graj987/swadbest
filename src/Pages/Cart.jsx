import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Recalculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);
  }, [cart]);

  const updateQuantity = (id, delta) => {
    const updatedCart = cart.map((item) =>
      item._id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleCheckout = () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-orange-50 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Your Cart is Empty 🛒
        </h2>
        <Link
          to="/products"
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md border border-orange-100">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          Your Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-gray-600 text-sm">
                <th className="text-left p-2">Product</th>
                <th className="p-2">Price</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Subtotal</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item._id} className="border-b hover:bg-orange-50">
                  <td className="flex items-center gap-3 p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg border"
                    />
                    <span className="font-medium text-gray-700">
                      {item.name}
                    </span>
                  </td>
                  <td className="text-center text-gray-700">₹{item.price}</td>
                  <td className="text-center">
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="bg-gray-200 px-2 py-1 rounded-l hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="px-3 text-gray-700 font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="bg-gray-200 px-2 py-1 rounded-r hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="text-center font-semibold text-gray-800">
                    ₹{item.price * item.quantity}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <Link
            to="/products"
            className="text-orange-500 hover:underline font-medium"
          >
            ← Continue Shopping
          </Link>

          <div className="text-right">
            <p className="text-gray-700">
              Total:{" "}
              <span className="text-2xl font-bold text-orange-600">
                ₹{total}
              </span>
            </p>
            <button
              onClick={handleCheckout}
              className="mt-3 bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
