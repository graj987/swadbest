import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";
import { emitCartUpdate } from "@/utils/CartEvent";
import {
  Heart,
  ShoppingCart,
  X,
  ArrowRight,
  Package,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/* ─────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="aspect-square bg-stone-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-stone-200 rounded-full w-3/4" />
        <div className="h-4 bg-stone-200 rounded-full w-1/3" />
        <div className="flex gap-2 mt-4">
          <div className="flex-1 h-9 bg-stone-200 rounded-xl" />
          <div className="w-9 h-9 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
function WishlistCard({ product, onRemove, onMoveToCart }) {
  const [moving,   setMoving]   = useState(false);
  const [removing, setRemoving] = useState(false);
  const [moved,    setMoved]    = useState(false);

  const handleMove = async () => {
    try {
      setMoving(true);
      await onMoveToCart(product._id);
      setMoved(true);
    } finally {
      setMoving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);
      await onRemove(product._id);
    } finally {
      setRemoving(false);
    }
  };

  // use first variant price if product.price is missing
  const displayPrice = product.price ?? product.variants?.[0]?.price ?? 0;

  return (
    <div className="group bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* Image */}
      <Link to={`/products/${product._id}`} className="block relative overflow-hidden aspect-square bg-stone-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-400"
        />
        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={removing}
          title="Remove from wishlist"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100"
        >
          {removing
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          }
        </button>
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-1">
            {product.category}
          </p>
        )}

        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-base font-black text-stone-900 mt-1.5">
          ₹{displayPrice.toLocaleString("en-IN")}
        </p>

        {/* Actions */}
        <div className="mt-3.5 flex gap-2">
          <button
            onClick={handleMove}
            disabled={moving || moved}
            className={`
              flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5
              transition-all duration-150
              ${moved
                ? "bg-emerald-500 text-white"
                : moving
                  ? "bg-orange-400/70 text-white cursor-wait"
                  : "bg-orange-600 hover:bg-orange-500 text-white shadow-sm shadow-orange-600/20 active:scale-[0.98]"
              }
            `}
          >
            {moving  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Moving…</>
            : moved   ? <><CheckCircle2 className="w-3.5 h-3.5" /> Added!</>
            :           <><ShoppingCart className="w-3.5 h-3.5" /> Move to Cart</>
            }
          </button>

          {/* Remove (visible always on mobile, hover on desktop) */}
          <button
            onClick={handleRemove}
            disabled={removing}
            title="Remove"
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all sm:opacity-100 group-hover:opacity-100"
          >
            {removing
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Wishlist = () => {
  const { user, getAuthHeader } = useAuth();
  const { refetch }             = useCartCount();

  const [wishlist, setWishlist] = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* ── fetch ── */
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await API.get("/api/cart/wishlist", { headers: getAuthHeader() });
      setWishlist(data.products || []);
      emitCartUpdate();
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeader]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  /* ── remove ── */
  const removeFromWishlist = async (productId) => {
    await API.post("/api/cart/wishlist/toggle", { productId }, { headers: getAuthHeader() });
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
    refetch?.();
    emitCartUpdate();
  };

  /* ── move to cart ── */
  const moveToCart = async (productId) => {
    try {
      await API.post("/api/cart/wishlist/move-to-cart", { productId, quantity: 1 }, { headers: getAuthHeader() });
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      refetch?.();
      emitCartUpdate();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to move item");
    }
  };

  /* ─────────── STATES ─────────── */

  /* Not logged in */
  if (!user) return (
    <div className="min-h-[70vh] bg-stone-50 flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <Heart className="w-7 h-7 text-red-400" strokeWidth={1.8} />
      </div>
      <div>
        <h2 className="text-xl font-black text-stone-900">Sign in to view your wishlist</h2>
        <p className="text-stone-400 text-sm mt-1">Save products you love and buy them later.</p>
      </div>
      <Link to="/login"
        className="h-11 px-8 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20 transition-all">
        Sign In <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  /* Loading */
  if (loading) return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-6">
        <div className="h-8 w-40 bg-stone-200 rounded-full animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {Array.from({length: 8}).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );

  /* Empty */
  if (wishlist.length === 0) return (
    <div className="min-h-[70vh] bg-stone-50 flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
        <Package className="w-7 h-7 text-stone-400" strokeWidth={1.8} />
      </div>
      <div>
        <h2 className="text-xl font-black text-stone-900">Your wishlist is empty</h2>
        <p className="text-stone-400 text-sm mt-1">Add items you love — buy them when you're ready.</p>
      </div>
      <Link to="/products"
        className="h-11 px-8 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20 transition-all">
        Browse Products <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-stone-50 pb-20">

      {/* ── Header ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #431407 0%, #7c2d12 50%, #c2410c 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"180px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-300 fill-red-300" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">My Wishlist</h1>
              <p className="text-white/50 text-sm mt-0.5">
                {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={removeFromWishlist}
              onMoveToCart={moveToCart}
            />
          ))}
        </div>

        {/* Continue shopping */}
        <div className="mt-10 text-center">
          <Link to="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;