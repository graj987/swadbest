import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";
import { useState } from "react";
import { emitCartUpdate } from "@/utils/CartEvent";
import { Heart, ShoppingCart, CheckCircle2 } from "lucide-react";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user, getAuthHeader, isAuthenticated } = useAuth();
  const { refetch } = useCartCount({ enabled: isAuthenticated });

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAdding,   setIsAdding]   = useState(false);
  const [added,      setAdded]      = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishPulse,  setWishPulse]  = useState(false);

  const variant = product?.variants?.[selectedVariantIndex];
  if (!variant) return null;

  const inStock     = variant.stock > 0;
  const lowStock    = inStock && variant.stock <= 5;
  const hasDiscount = variant.mrp && variant.mrp > variant.price;
  const discountPct = hasDiscount ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100) : 0;

  /* ── add to cart ── */
  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    if (!inStock || isAdding) return;
    try {
      setIsAdding(true);
      await API.post(
        "/api/cart/add",
        { productId: product._id, quantity: 1, variant: { weight: variant.weight, price: variant.price, stock: variant.stock } },
        { headers: getAuthHeader() }
      );
      refetch?.();
      setAdded(true);
      emitCartUpdate();
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setIsAdding(false);
    }
  };

  /* ── wishlist ── */
  const handleWishlist = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    try {
      setWishlisted((p) => !p);
      setWishPulse(true);
      setTimeout(() => setWishPulse(false), 400);
      await API.post("/api/cart/wishlist/toggle", { productId: product._id }, { headers: getAuthHeader() });
      emitCartUpdate();
    } catch (err) {
      console.error("Wishlist toggle failed", err);
      setWishlisted((p) => !p);
    }
  };

  return (
    <div className="group relative bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

      {/* ── IMAGE ── */}
      <Link to={`/products/${product._id}`} className="block relative aspect-square bg-stone-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
            -{discountPct}%
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        aria-label="Toggle wishlist"
        className={`
          absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center
          shadow-sm border transition-all duration-150
          ${wishlisted
            ? "bg-red-50 border-red-200 text-red-500"
            : "bg-white/90 border-stone-200 text-stone-400 hover:text-red-400 hover:border-red-200"}
          ${wishPulse ? "scale-125" : "scale-100"}
        `}
      >
        <Heart
          className={`w-3.5 h-3.5 transition-all ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
          strokeWidth={2}
        />
      </button>

      {/* ── CONTENT ── */}
      <div className="p-3.5 space-y-2.5">

        {/* Category tag */}
        {product.category && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] text-orange-600/80">
            {product.category}
          </span>
        )}

        {/* Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Variant pills */}
        {product.variants.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {product.variants.map((v, i) => (
              <button
                key={i}
                disabled={v.stock === 0}
                onClick={() => setSelectedVariantIndex(i)}
                className={`
                  px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all duration-100
                  ${i === selectedVariantIndex
                    ? "bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-600/20"
                    : v.stock === 0
                      ? "bg-stone-50 text-stone-300 border-stone-150 cursor-not-allowed line-through"
                      : "bg-white text-stone-600 border-stone-200 hover:border-orange-400 hover:text-orange-600"}
                `}
              >
                {v.weight}
              </button>
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-end gap-1.5">
          <span className="text-base font-black text-stone-900">₹{variant.price}</span>
          {hasDiscount && (
            <span className="text-xs text-stone-400 line-through mb-0.5">₹{variant.mrp}</span>
          )}
          <span className="text-[11px] text-stone-400 mb-0.5 ml-auto">/{variant.weight}</span>
        </div>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            !inStock ? "bg-red-400" : lowStock ? "bg-amber-400" : "bg-emerald-400"
          }`} />
          <span className={`text-[11px] font-semibold ${
            !inStock ? "text-red-500" : lowStock ? "text-amber-600" : "text-emerald-600"
          }`}>
            {!inStock ? "Out of stock" : lowStock ? `Only ${variant.stock} left` : "In stock"}
          </span>
        </div>

        {/* Add to cart button */}
        <button
          disabled={!inStock || isAdding}
          onClick={handleAddToCart}
          className={`
            w-full h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5
            transition-all duration-150
            ${!inStock
              ? "bg-stone-100 text-stone-400 cursor-not-allowed"
              : added
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                : isAdding
                  ? "bg-orange-400/70 text-white cursor-wait"
                  : "bg-orange-600 hover:bg-orange-500 text-white shadow-sm shadow-orange-600/20 active:scale-[0.98]"}
          `}
        >
          {isAdding ? (
            <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Adding…</>
          ) : added ? (
            <><CheckCircle2 className="w-3.5 h-3.5" /> Added!</>
          ) : (
            <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
}