// src/pages/Cart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "/hooks/useAuth";

const isValidCartItem = (item) =>
  item &&
  typeof item === "object" &&
  typeof item._id === "string" &&
  typeof item.name === "string" &&
  typeof item.price === "number" &&
  item.price >= 0 &&
  typeof item.quantity === "number" &&
  item.quantity > 0;

const MAX_QTY = 10;

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);

  /* ---------- Load & sanitize cart ---------- */
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("cart")) || [];
    const clean = raw.filter(isValidCartItem);

    if (clean.length !== raw.length) {
      localStorage.setItem("cart", JSON.stringify(clean));
    }

    setCart(clean);
  }, []);

  /* ---------- Total (memoized) ---------- */
  const total = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );

  /* ---------- Persist helper ---------- */
  const persist = (next) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  /* ---------- Quantity ---------- */
  const updateQuantity = (_id, delta) => {
    persist(
      cart.map((item) =>
        item._id === _id
          ? {
              ...item,
              quantity: Math.min(
                MAX_QTY,
                Math.max(1, item.quantity + delta)
              ),
            }
          : item
      )
    );
  };

  /* ---------- Remove ---------- */
  const removeItem = (_id) => {
    if (!window.confirm("Remove this item from cart?")) return;
    persist(cart.filter((i) => i._id !== _id));
  };

  /* ---------- Checkout ---------- */
  const handleCheckout = () => {
    if (!cart.length || checkingOut) return;

    setCheckingOut(true);

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  /* ---------- Empty ---------- */
  if (!cart.length) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-orange-50 px-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Your Cart is Empty 🛒
        </h2>
        <Link
          to="/products"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-lg border">

        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          Your Cart ({cart.length} items)
        </h2>

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-xl p-4 hover:bg-orange-50"
            >
              {/* Product */}
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">₹{item.price}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item._id, -1)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  −
                </button>
                <span className="font-semibold w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item._id, 1)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <div className="font-semibold text-gray-800">
                ₹{item.price * item.quantity}
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item._id)}
                className="text-red-500 font-semibold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 border-t pt-4">
          <Link to="/products" className="text-orange-500 font-medium">
            ← Continue Shopping
          </Link>

          <div className="text-right">
            <p className="text-lg">
              Total{" "}
              <span className="text-2xl font-bold text-orange-600">
                ₹{total}
              </span>
            </p>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-3 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-60"
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
