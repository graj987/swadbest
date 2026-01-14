import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";
import { useState } from "react";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();
  const { refetch } = useCartCount();

  // 🔥 VARIANT STATE
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const variant = product?.variants?.[selectedVariantIndex];

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!variant || variant.stock === 0) {
      alert("Please select an available variant");
      return;
    }

    try {
      await API.post(
        "/api/cart/cart/add",
        {
          productId: product._id,
          quantity: 1,
          variant: {
            weight: variant.weight,
            price: variant.price,
            stock: variant.stock,
          },
        },
        { headers: getAuthHeader() }
      );

      refetch?.();
    } catch (err) {
      console.error("Add to cart failed", err);
      alert(err?.response?.data?.message || "Failed to add to cart");
    }
  };

  /* ================= TOGGLE WISHLIST ================= */
  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await API.post(
        "/api/cart/wishlist/toggle",
        { productId: product._id },
        { headers: getAuthHeader() }
      );

      refetch?.();
    } catch (err) {
      console.error("Wishlist toggle failed", err);
      alert(err?.response?.data?.message || "Wishlist action failed");
    }
  };

  if (!variant) return null;

  return (
    <div
      className="
        group bg-white border border-gray-200 rounded-2xl overflow-hidden
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      "
    >
      {/* IMAGE */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="
              w-full h-full object-cover
              transition-transform duration-500 group-hover:scale-105
            "
          />
        </Link>

        {/* WISHLIST */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="
            absolute top-3 right-3 h-9 w-9 rounded-full
            bg-white/90 backdrop-blur flex items-center justify-center
            shadow hover:scale-110 transition
          "
        >
          <span className="text-lg">♡</span>
        </button>

        {/* OUT OF STOCK OVERLAY (VARIANT-BASED) */}
        {variant.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        {/* VARIANT SELECTOR */}
        <div className="flex gap-2 flex-wrap">
          {product.variants.map((v, i) => (
            <button
              key={i}
              disabled={v.stock === 0}
              onClick={() => setSelectedVariantIndex(i)}
              className={`
                px-3 py-1 rounded-full text-xs border transition
                ${
                  i === selectedVariantIndex
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white text-gray-700"
                }
                ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              {v.weight}
            </button>
          ))}
        </div>

        {/* PRICE */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-600">
            ₹{variant.price}
          </span>
        </div>

        {/* STOCK INFO */}
        <div className="text-xs">
          {variant.stock > 0 ? (
            <span className="text-green-600">
              In stock ({variant.stock})
            </span>
          ) : (
            <span className="text-red-600">Out of stock</span>
          )}
        </div>

        {/* ADD TO CART */}
        <button
          disabled={variant.stock === 0}
          onClick={handleAddToCart}
          className={`
            w-full mt-3 rounded-xl py-2.5 text-sm font-semibold transition
            ${
              variant.stock > 0
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {variant.stock > 0 ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
