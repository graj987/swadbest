import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import SafeImage from "../Components/SafeImage";
import useAuth from "../Hooks/useAuth";
import useCartCount from "../Hooks/useCartCount";
import ProductTabs from "@/Components/ProductTab";
import {
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Leaf,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-stone-200 rounded-xl ${className}`} />
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 pb-32 md:pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-10">
        <Skeleton className="w-28 h-4 mb-8 rounded-full" />
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-12 w-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TRUST BADGE ROW
───────────────────────────────────────────── */
const TRUST = [
  { icon: ShieldCheck, label: "FSSAI Certified" },
  { icon: Leaf, label: "No Preservatives" },
  { icon: Truck, label: "Free Delivery ₹499+" },
  { icon: RotateCcw, label: "Easy Returns" },
];

function TrustRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      {TRUST.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100"
          >
            <Icon
              className="w-3.5 h-3.5 text-amber-700 shrink-0"
              strokeWidth={2}
            />
            <span className="text-[11px] font-semibold text-amber-800 leading-tight">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();
  const { refetch } = useCartCount();

  const [product, setProduct] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/api/products/${id}`);
        setProduct(res.data);
        setActiveImg(res.data?.image);
      } catch {
        /* handled below */
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const variant = product?.variants?.[selectedVariantIndex];

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!variant || variant.stock === 0) return;
    try {
      setAdding(true);
      await API.post(
        "/api/cart/add",
        {
          productId: product._id,
          quantity: qty,
          variant: {
            weight: variant.weight,
            price: variant.price,
            stock: variant.stock,
          },
        },
        { headers: getAuthHeader() },
      );
      refetch?.();
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } catch {
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  /* ── states ── */
  if (loading) return <PageSkeleton />;

  if (!product || !variant) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <XCircle className="w-12 h-12 text-stone-300" />
        <p className="text-stone-500 font-medium">Product not found</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-amber-700 font-semibold hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const inStock = variant.stock > 0;
  const images = product.images?.length
    ? product.images
    : [product.image].filter(Boolean);
  const hasDiscount = variant.mrp && variant.mrp > variant.price;
  const discountPct = hasDiscount
    ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
    : 0;

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-stone-50 pb-32 md:pb-16">
      {/* ── Breadcrumb bar ── */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-2 text-sm text-stone-500">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 hover:text-stone-800 transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <span className="text-stone-300">/</span>
          <span className="text-stone-400 text-xs truncate max-w-[200px]">
            {product.category}
          </span>
          <span className="text-stone-300">/</span>
          <span className="text-stone-700 font-semibold text-xs truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-7 pb-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* ══════ LEFT: IMAGE PANEL ══════ */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-stone-100 shadow-sm">
              {hasDiscount && (
                <div className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow">
                  -{discountPct}%
                </div>
              )}
              <SafeImage
                src={activeImg || product.image}
                alt={product.name}
                className="w-full h-full object-contain p-6"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(img)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                      ${activeImg === img ? "border-amber-500 shadow-md shadow-amber-500/20" : "border-stone-200 hover:border-stone-300"}`}
                  >
                    <SafeImage
                      src={img}
                      alt=""
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ══════ RIGHT: DETAILS PANEL ══════ */}
          <div className="flex flex-col gap-0">
            {/* Category tag */}
            <span className="inline-block self-start text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full mb-3">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-2xl sm:text-[1.85rem] font-black text-stone-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    viewBox="0 0 12 12"
                    className={`w-3.5 h-3.5 ${s <= 4 ? "text-amber-400" : "text-stone-200"}`}
                    fill="currentColor"
                  >
                    <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8.1 3.22 9.55l.53-3.09L1.5 4.27l3.11-.45z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-600">4.8</span>
              <span className="text-xs text-stone-400">(124 reviews)</span>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-stone-100 my-4" />

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-[2rem] font-black text-stone-900 leading-none">
                ₹{variant.price}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-stone-400 line-through mb-0.5">
                    ₹{variant.mrp}
                  </span>
                  <span className="mb-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    Save ₹{variant.mrp - variant.price}
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className="mt-2 flex items-center gap-1.5">
              {inStock ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">
                    In Stock
                  </span>
                  {variant.stock <= 10 && (
                    <span className="text-xs text-rose-500 font-medium ml-1">
                      · Only {variant.stock} left
                    </span>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-500">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-stone-500 leading-relaxed">
              {product.description ||
                "Premium quality, handcrafted spice blend made with no preservatives."}
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-stone-100 my-4" />

            {/* Variant selector */}
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-2.5">
                Select Weight
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedVariantIndex(i);
                      setQty(1);
                    }}
                    disabled={v.stock === 0}
                    className={`
                      relative px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-150
                      ${
                        i === selectedVariantIndex
                          ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20"
                          : v.stock === 0
                            ? "bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed"
                            : "bg-white text-stone-700 border-stone-200 hover:border-amber-400 hover:text-amber-700"
                      }
                    `}
                  >
                    {v.weight}
                    {v.stock === 0 && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-px bg-stone-300 absolute rotate-12" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty selector */}
            <div className="mt-5 flex items-center gap-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-stone-400">
                Qty
              </p>
              <div className="flex items-center gap-0 rounded-xl border border-stone-200 overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 h-9 flex items-center justify-center text-sm font-bold text-stone-800 border-x border-stone-200">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(variant?.stock || 10, q + 1))
                  }
                  disabled={qty >= (variant?.stock || 10)}
                  className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-stone-400">
                × ₹{variant.price} ={" "}
                <span className="font-bold text-stone-700">
                  ₹{variant.price * qty}
                </span>
              </span>
            </div>

            {/* CTA — desktop only */}
            <div className="hidden md:flex gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || adding}
                className={`
                  flex-1 h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2
                  transition-all duration-200
                  ${
                    !inStock
                      ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                      : addedFeedback
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 hover:shadow-amber-500/30 active:scale-[0.99]"
                  }
                `}
              >
                {adding ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : addedFeedback ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="h-12 px-5 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                View Cart
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trust badges */}
            <TrustRow />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-10 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <ProductTabs product={product} />
        </div>
      </div>

      {/* ══════ MOBILE STICKY BAR ══════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-3 flex gap-3 items-center max-w-lg mx-auto">
          {/* Price block */}
          <div className="shrink-0">
            <p className="text-[10px] text-stone-400 font-medium">Total</p>
            <p className="text-base font-black text-stone-900 leading-tight">
              ₹{variant.price * qty}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className={`
              flex-1 h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2
              transition-all duration-200
              ${
                !inStock
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : addedFeedback
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 active:scale-[0.98]"
              }
            `}
          >
            {adding ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : addedFeedback ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="h-12 px-4 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-700 flex items-center gap-1 whitespace-nowrap active:bg-stone-50"
          >
            Cart
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Safe-area spacer for modern phones */}
        <div
          className="h-safe-area-inset-bottom"
          style={{ height: "env(safe-area-inset-bottom, 0px)" }}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
