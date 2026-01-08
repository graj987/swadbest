// src/pages/Cart.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "@/Hooks/useAuth";
import API from "@/api";

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
  const [loadingStock, setLoadingStock] = useState(false);

  const validatedStockRef = useRef(false);

  /* ---------- Load & sanitize cart ---------- */
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("cart")) || [];
    const clean = raw.filter(isValidCartItem);

    if (clean.length !== raw.length) {
      localStorage.setItem("cart", JSON.stringify(clean));
    }

    setCart(clean);
  }, []);

  /* ---------- REAL-TIME STOCK CHECK (Safe, no infinite loop) ---------- */
 /* ---------- REAL-TIME STOCK CHECK (Safe, no infinite loop) ---------- */
useEffect(() => {
  if (!cart.length) return;
  if (validatedStockRef.current) return;

  validatedStockRef.current = true; // Prevent re-run

  const validateStock = async () => {
    try {
      setLoadingStock(true);

      const ids = cart.map((i) => i._id);
      const res = await API.post("/api/orders/check-stock", { ids });

      const stockMap = res.data.stock || {};

      const updated = cart.map((item) => {
        if (!stockMap[item._id]) {
          return { ...item, stock: 0 };
        }
        return { ...item, stock: stockMap[item._id] };
      });

      persist(updated);
    } catch (err) {
      console.error("Stock validation error:", err);
    } finally {
      setLoadingStock(false);
    }
  };

  validateStock();
}, [cart]);


  /* ---------- Persist ---------- */
  const persist = (next) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  /* ---------- Total ---------- */
  const total = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );

  /* ---------- Quantity ---------- */
  const updateQuantity = (_id, delta) => {
    persist(
      cart.map((item) =>
        item._id === _id
          ? {
              ...item,
              quantity: Math.min(MAX_QTY, Math.max(1, item.quantity + delta)),
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

  /* ---------- EMPTY CART ---------- */
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
    <div className="min-h-screen bg-orange-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-orange-100">
        {/* HEADER */}
        <h2 className="text-xl md:text-2xl font-bold text-orange-600 mb-4">
          Your Cart <span className="text-gray-600">({cart.length} items)</span>
        </h2>

        {loadingStock && (
          <p className="text-sm text-orange-500 mb-3">
            Checking latest stock… please wait
          </p>
        )}

        {/* CART LIST */}
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-orange-100 bg-orange-50/20 hover:shadow-sm transition"
            >
              {/* PRODUCT IMAGE & DETAILS */}
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover border"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm md:text-base">
                    {item.name}
                  </p>

                  <p className="text-xs text-gray-500">₹{item.price}</p>

                  {item.stock === 0 ? (
                    <p className="text-xs font-semibold text-red-600 mt-1">
                      ❌ Out of stock
                    </p>
                  ) : item.stock <= 5 ? (
                    <p className="text-xs font-semibold text-orange-600 mt-1">
                      ⚠ Only {item.stock} left
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1">✔ In Stock</p>
                  )}
                </div>
              </div>

              {/* QTY CONTROLS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item._id, -1)}
                  className="w-8 h-8 rounded-md bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300"
                >
                  −
                </button>

                <span className="font-semibold w-6 text-center text-sm">
                  {item.quantity}
                </span>

                <button
                  onClick={() => updateQuantity(item._id, 1)}
                  className="w-8 h-8 rounded-md bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
              </div>

              {/* SUBTOTAL */}
              <div className="text-sm font-bold text-gray-800 min-w-[60px] text-right">
                ₹{item.price * item.quantity}
              </div>

              {/* REMOVE */}
              <button
                onClick={() => removeItem(item._id)}
                className="text-red-500 text-lg hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="mt-8 border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <Link
            to="/products"
            className="text-orange-500 font-medium hover:underline"
          >
            ← Continue Shopping
          </Link>

          <div className="text-right w-full sm:w-auto">
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="text-xl font-bold text-gray-900">₹{total}</p>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-4 bg-orange-500 text-white w-full sm:w-auto px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-60"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE CHECKOUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex sm:hidden justify-between items-center">
        <span className="text-lg font-bold text-gray-800">₹{total}</span>

        <button
          onClick={handleCheckout}
          className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
