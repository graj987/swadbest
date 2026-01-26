import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";
import { emitCartUpdate } from "@/utils/CartEvent";

const MAX_QTY = 10;

const Cart = () => {
  const navigate = useNavigate();
  const {  getAuthHeader, isAuthenticated } = useAuth();

  
const { refetch } = useCartCount({ enabled: isAuthenticated });


  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(null);

  /* ================= FETCH CART ================= */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const { data } = await API.get("/api/cart", {
        headers: getAuthHeader(),
      });
      setCart(data.items || []);
    } catch (err) {
      console.error("Fetch cart failed", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAuthHeader]);

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
  const updateQuantity = async (productId, weight, newQty) => {
    if (newQty < 1 || newQty > MAX_QTY) return;

    const key = `${productId}-${weight}`;
    setUpdatingKey(key);

    try {
      await API.patch(
        "/api/cart/update",
        { productId, weight, quantity: newQty },
        { headers: getAuthHeader() }
      );

      setCart((prev) =>
        prev.map((i) =>
          i.product._id === productId && i.variant.weight === weight
            ? { ...i, quantity: newQty }
            : i
        )
      );

      refetch?.();
    } catch (err) {
      console.error("Update quantity failed", err);
    } finally {
      setUpdatingKey(null);
    }
  };

  /* ================= CHANGE VARIANT ================= */
  const changeVariant = async (productId, oldWeight, newVariant) => {
    const key = `${productId}-${oldWeight}`;
    setUpdatingKey(key);

    try {
      await API.patch(
        "/api/cart/update",
        {
          productId,
          oldWeight,
          variant: newVariant,
        },
        { headers: getAuthHeader() }
      );

      await fetchCart();
      refetch?.();
    } catch (err) {
      console.error("Variant change failed", err);
    } finally {
      setUpdatingKey(null);
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (productId, weight) => {
    const key = `${productId}-${weight}`;
    setUpdatingKey(key);

    try {
      await API.delete(`/api/cart/remove/${productId}`, {
        headers: getAuthHeader(),
        data: { weight },
      });

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
      emitCartUpdate();
    } catch (err) {
      console.error("Remove item failed", err);
    } finally {
      setUpdatingKey(null);
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
  if (!isAuthenticated) {
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
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your cart…
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-orange-50 px-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Your cart is empty 🛒
        </h2>
        <Link
          to="/products"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Shop Products
        </Link>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-orange-50 px-3 py-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* CART ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(({ product, variant, quantity }) => {
            const key = `${product._id}-${variant.weight}`;
            const updating = updatingKey === key;

            return (
              <div
                key={key}
                className="bg-white rounded-xl p-4 flex gap-4 items-start shadow-sm border"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />

                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-sm line-clamp-2">
                    {product.name}
                  </p>

                  <div className="flex gap-2 flex-wrap mt-1">
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        disabled={v.stock === 0 || updating}
                        onClick={() =>
                          changeVariant(
                            product._id,
                            variant.weight,
                            v
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs border transition
                          ${
                            v.weight === variant.weight
                              ? "bg-orange-600 text-white border-orange-600"
                              : "bg-white text-gray-700"
                          }
                          ${v.stock === 0 ? "opacity-40" : ""}
                        `}
                      >
                        {v.weight}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      disabled={updating || quantity === 1}
                      onClick={() =>
                        updateQuantity(
                          product._id,
                          variant.weight,
                          quantity - 1
                        )
                      }
                      className="w-8 h-8 bg-gray-200 rounded"
                    >
                      −
                    </button>

                    <span className="font-semibold">{quantity}</span>

                    <button
                      disabled={updating || quantity === MAX_QTY}
                      onClick={() =>
                        updateQuantity(
                          product._id,
                          variant.weight,
                          quantity + 1
                        )
                      }
                      className="w-8 h-8 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <p className="font-bold">
                    ₹{variant.price * quantity}
                  </p>
                  <button
                    disabled={updating}
                    onClick={() =>
                      removeItem(product._id, variant.weight)
                    }
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="bg-white rounded-xl p-5 shadow-sm border h-fit sticky top-20">
          <h3 className="text-lg font-bold mb-4">Order Summary</h3>

          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>

          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="mt-5 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
