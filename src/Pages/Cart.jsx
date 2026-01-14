import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";

const MAX_QTY = 10;

const Cart = () => {
  const navigate = useNavigate();
  const { user, getAuthHeader, isAuthenticated } = useAuth();
  const { refetch } = useCartCount();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  /* ================= FETCH CART ================= */
  const fetchCart = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await API.get("/api/cart/cart", {
        headers: getAuthHeader(),
      });
      setCart(data.items || []);
    } catch (err) {
      console.error("Fetch cart failed", err);
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeader]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ================= TOTAL ================= */
  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0
      ),
    [cart]
  );

  /* ================= UPDATE QTY ================= */
  const updateQuantity = async (productId, weight, delta) => {
    if (updating) return;

    const item = cart.find(
      (i) =>
        i.product._id === productId &&
        i.variant.weight === weight
    );

    if (!item) return;

    const newQty = Math.min(
      MAX_QTY,
      Math.max(1, item.quantity + delta)
    );

    if (newQty === item.quantity) return;

    try {
      setUpdating(true);

      await API.patch(
        "/api/cart/cart/update",
        {
          productId,
          weight,
          quantity: newQty,
        },
        { headers: getAuthHeader() }
      );

      setCart((prev) =>
        prev.map((i) =>
          i.product._id === productId &&
          i.variant.weight === weight
            ? { ...i, quantity: newQty }
            : i
        )
      );

      refetch?.();
    } catch (err) {
      console.error("Update quantity failed", err);
    } finally {
      setUpdating(false);
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (productId, weight) => {
    if (!window.confirm("Remove this item from cart?")) return;

    try {
      await API.delete(
        `/api/cart/cart/remove/${productId}/${encodeURIComponent(weight)}`,
        { headers: getAuthHeader() }
      );

      setCart((prev) =>
        prev.filter(
          (i) =>
            !(
              i.product._id === productId &&
              i.variant.weight === weight
            )
        )
      );

      refetch?.();
    } catch (err) {
      console.error("Remove item failed", err);
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    if (!cart.length) return;

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  /* ================= STATES ================= */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link
          to="/login"
          className="px-6 py-3 bg-orange-600 text-white rounded-lg"
        >
          Login to view cart
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading cart…
      </div>
    );
  }

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

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-orange-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-xl md:text-2xl font-bold text-orange-600 mb-6">
          Your Cart ({cart.length} items)
        </h2>

        <div className="space-y-4">
          {cart.map(({ product, variant, quantity }) => (
            <div
              key={`${product._id}-${variant.weight}`}
              className="flex flex-col sm:flex-row items-center gap-4 border rounded-lg p-4"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover"
              />

              <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-xs text-gray-500">
                  {variant.weight}
                </p>
                <p className="text-sm text-gray-700">
                  ₹{variant.price}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(product._id, variant.weight, -1)
                  }
                  className="w-8 h-8 bg-gray-200 rounded"
                >
                  −
                </button>
                <span className="font-semibold">{quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(product._id, variant.weight, 1)
                  }
                  className="w-8 h-8 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>

              <p className="font-bold min-w-[70px] text-right">
                ₹{variant.price * quantity}
              </p>

              <button
                onClick={() =>
                  removeItem(product._id, variant.weight)
                }
                className="text-red-500 text-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-6 flex justify-between items-center">
          <Link to="/products" className="text-orange-500 hover:underline">
            ← Continue Shopping
          </Link>

          <div className="text-right">
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="text-2xl font-bold">₹{total}</p>

            <button
              onClick={handleCheckout}
              className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
