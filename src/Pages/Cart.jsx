import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";
import { emitCartUpdate } from "@/utils/CartEvent";

const MAX_QTY = 10;
const FREE_SHIPPING_LIMIT = 499;

/* ------------------ HELPERS ------------------ */
const getEstimatedDelivery = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toDateString();
};

/* ------------------ SKELETON ------------------ */
const CartSkeleton = () => (
  <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 animate-pulse">
    <div className="lg:col-span-2 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-xl border flex gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
    <div className="bg-white p-6 rounded-xl border h-fit">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-3 bg-gray-200 rounded mb-2" />
      <div className="h-3 bg-gray-200 rounded mb-4" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  </div>
);

/* ------------------ MAIN ------------------ */
const Cart = () => {
  const navigate = useNavigate();
  const { getAuthHeader, isAuthenticated } = useAuth();
  const { refetch } = useCartCount({ enabled: isAuthenticated });

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(null);

  /* FETCH CART */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await API.get("/api/cart", {
        headers: getAuthHeader(),
      });
      setCart(data.items || []);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAuthHeader]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* TOTAL */
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0
      ),
    [cart]
  );

  /* UPDATE QTY */
  const updateQuantity = async (productId, weight, qty) => {
    if (qty < 1 || qty > MAX_QTY) return;
    const key = `${productId}-${weight}`;
    setUpdatingKey(key);

    await API.patch(
      "/api/cart/update",
      { productId, weight, quantity: qty },
      { headers: getAuthHeader() }
    );

    setCart((prev) =>
      prev.map((i) =>
        i.product._id === productId && i.variant.weight === weight
          ? { ...i, quantity: qty }
          : i
      )
    );

    setUpdatingKey(null);
    refetch?.();
  };

  /* REMOVE ITEM */
  const removeItem = async (productId, weight) => {
    const key = `${productId}-${weight}`;
    setUpdatingKey(key);

    await API.delete(`/api/cart/remove/${productId}`, {
      headers: getAuthHeader(),
      data: { weight },
    });

    setCart((prev) =>
      prev.filter(
        (i) =>
          !(i.product._id === productId && i.variant.weight === weight)
      )
    );

    setUpdatingKey(null);
    refetch?.();
    emitCartUpdate();
  };

  /* CLEAR CART */
  const clearCart = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    await API.delete("/api/cart/clear", {
      headers: getAuthHeader(),
    });
    setCart([]);
    refetch?.();
    emitCartUpdate();
  };

  /* STATES */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link
          to="/login"
          className="bg-orange-600 text-white px-6 py-3 rounded-lg"
        >
          Login to view cart
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <CartSkeleton />
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg mb-4">Your cart is empty 🛒</p>
        <Link
          to="/products"
          className="bg-orange-600 text-white px-6 py-3 rounded-lg"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  /* UI */
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* CART */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow border">
          <div className="hidden md:grid grid-cols-4 px-6 py-4 border-b text-sm font-semibold text-gray-600">
            <span>Product</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Subtotal</span>
          </div>

          {cart.map(({ product, variant, quantity }) => {
            const key = `${product._id}-${variant.weight}`;
            const updating = updatingKey === key;

            return (
              <div
                key={key}
                className="grid md:grid-cols-4 gap-4 px-6 py-5 border-b items-center"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      Weight: {variant.weight}
                    </p>
                    <button
                      onClick={() =>
                        removeItem(product._id, variant.weight)
                      }
                      className="text-xs text-red-500 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="text-center">₹{variant.price}</p>

                <div className="flex justify-center items-center gap-2">
                  <button
                    disabled={quantity === 1 || updating}
                    onClick={() =>
                      updateQuantity(
                        product._id,
                        variant.weight,
                        quantity - 1
                      )
                    }
                    className="w-8 h-8 border rounded"
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    disabled={quantity === MAX_QTY || updating}
                    onClick={() =>
                      updateQuantity(
                        product._id,
                        variant.weight,
                        quantity + 1
                      )
                    }
                    className="w-8 h-8 border rounded"
                  >
                    +
                  </button>
                </div>

                <p className="text-right font-semibold">
                  ₹{variant.price * quantity}
                </p>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="bg-white rounded-xl shadow border p-6 h-fit sticky top-20">
          <h3 className="text-lg font-bold mb-4">Order Summary</h3>

          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>

          {subtotal >= FREE_SHIPPING_LIMIT ? (
            <div className="mt-3 text-sm text-green-600">
              🚚 Free shipping applied
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-500">
              Add ₹{FREE_SHIPPING_LIMIT - subtotal} more for free shipping
            </div>
          )}

          <div className="mt-3 text-sm text-gray-600">
            📦 Estimated delivery by <b>{getEstimatedDelivery()}</b>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={clearCart}
            className="mt-3 w-full border border-red-500 text-red-600 py-2 rounded-lg text-sm"
          >
            Clear Shopping Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
