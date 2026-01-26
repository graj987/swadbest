import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";
import { useState } from "react";
import { emitCartUpdate } from "@/utils/CartEvent";


export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user, getAuthHeader, isAuthenticated } = useAuth();

const { refetch } = useCartCount({ enabled: isAuthenticated });


  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const variant = product?.variants?.[selectedVariantIndex];
  if (!variant) return null;

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (variant.stock === 0 || isAdding) return;

    try {
      setIsAdding(true);

      await API.post(
        "/api/cart/add",
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

      refetch?.(); // safe now
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      emitCartUpdate();

    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setIsAdding(false);
    }
  };

  /* ================= WISHLIST ================= */
  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setWishlisted((prev) => !prev);

      await API.post(
        "/api/cart/wishlist/toggle",
        { productId: product._id },
        { headers: getAuthHeader() }
      );
      emitCartUpdate();

    } catch (err) {
      console.error("Wishlist toggle failed", err);
      setWishlisted((prev) => !prev);
    }
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* IMAGE */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* WISHLIST */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow transition hover:scale-110"
        >
          <span
            className={`text-lg transition ${
              wishlisted ? "text-red-500 scale-110" : "text-gray-400"
            }`}
          >
            {wishlisted ? "♥" : "♡"}
          </span>
        </button>

        {variant.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex gap-2 flex-wrap">
          {product.variants.map((v, i) => (
            <button
              key={i}
              disabled={v.stock === 0}
              onClick={() => setSelectedVariantIndex(i)}
              className={`px-3 py-1 rounded-full text-xs border transition
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

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-600">
            ₹{variant.price}
          </span>
          <span className="text-xs text-gray-500">/ {variant.weight}</span>
        </div>

        <div className="text-xs">
          {variant.stock > 0 ? (
            <span className="text-green-600">
              In stock ({variant.stock})
            </span>
          ) : (
            <span className="text-red-600">Out of stock</span>
          )}
        </div>

        <button
          disabled={variant.stock === 0 || isAdding}
          onClick={handleAddToCart}
          className={`w-full mt-3 rounded-xl py-2.5 text-sm font-semibold transition
            ${
              variant.stock > 0
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {isAdding
            ? "Adding..."
            : added
            ? "✔ Added to Cart"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
