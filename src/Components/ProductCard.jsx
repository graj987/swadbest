import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";

export default function ProductCard({ product }) {
  const { user, getAuthHeader } = useAuth();
  const { refetch } = useCartCount();
  const navigate = useNavigate();

  // ADD TO CART
  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      await API.post(
        "/api/cart/add",
        { productId: product._id, quantity: 1 },
        { headers: getAuthHeader() }
      );
      refetch?.();
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  // WISHLIST
  const handleWishlist = (e) => {
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = wishlist.find((item) => item._id === product._id);

    const updated = exists
      ? wishlist.filter((item) => item._id !== product._id)
      : [...wishlist, product];

    localStorage.setItem("wishlist", JSON.stringify(updated));
    navigate("/wishlist");
  };

  return (
    <div className="
      group bg-white border border-gray-200 rounded-2xl overflow-hidden
      transition-all duration-300
      hover:shadow-xl hover:-translate-y-1
    ">

      {/* IMAGE */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">

        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="
              w-full h-full object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
          />
        </Link>

        {/* DISCOUNT BADGE */}
        {product.discount && (
          <span className="
            absolute top-3 left-3
            rounded-full bg-orange-600 px-3 py-1
            text-xs font-semibold text-white
          ">
            {product.discount}% OFF
          </span>
        )}

        {/* WISHLIST */}
        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className="
            absolute top-3 right-3
            h-9 w-9 rounded-full
            bg-white/90 backdrop-blur
            flex items-center justify-center
            shadow hover:scale-110 transition
          "
        >
          <span className="text-lg">♡</span>
        </button>

        {/* OUT OF STOCK OVERLAY */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-sm font-semibold tracking-wide">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">

        {/* NAME */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        {/* PRICE */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-600">
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* RATING */}
        <div className="text-xs text-gray-500">
          ★ {product.rating || "4.5"} · {product.totalReviews || "120"} reviews
        </div>

        {/* CTA */}
        <button
          disabled={product.stock === 0}
          onClick={handleAddToCart}
          className={`
            w-full mt-3 rounded-xl py-2.5 text-sm font-semibold
            transition
            ${
              product.stock > 0
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {product.stock > 0 ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
