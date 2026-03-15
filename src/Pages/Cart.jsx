import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";
import { emitCartUpdate } from "@/utils/CartEvent";
import SafeImage from "@/Components/SafeImage";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight,
  Truck, Package, Tag, X, AlertCircle, ShieldCheck,
} from "lucide-react";

const MAX_QTY             = 10;
const FREE_SHIPPING_LIMIT = 499;

const getEstimatedDelivery = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" });
};

const getItemPrice = (item) =>
  item.variant?.price ??
  item.product?.variants?.[item.variantIndex ?? 0]?.price ??
  0;

/* ── Skeleton ── */
const CartSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-5 animate-pulse">
    <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 overflow-hidden">
      {[1,2,3].map(i => (
        <div key={i} className="flex gap-4 px-5 py-5 border-b border-stone-100 last:border-0">
          <div className="w-16 h-16 bg-stone-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-4 bg-stone-200 rounded-full w-2/3" />
            <div className="h-3 bg-stone-200 rounded-full w-1/3" />
            <div className="h-7 bg-stone-200 rounded-xl w-24 mt-3" />
          </div>
          <div className="h-4 bg-stone-200 rounded-full w-12 shrink-0" />
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-3 h-fit">
      <div className="h-5 bg-stone-200 rounded-full w-1/2" />
      {[1,2,3].map(i=><div key={i} className="h-3 bg-stone-200 rounded-full" />)}
      <div className="h-12 bg-stone-200 rounded-xl mt-2" />
    </div>
  </div>
);

/* ── Clear modal ── */
function ClearModal({ onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background:"rgba(0,0,0,0.4)", backdropFilter:"blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-100 p-7 w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.8} />
          </div>
        </div>
        <h3 className="text-lg font-black text-stone-900 text-center">Clear your cart?</h3>
        <p className="text-sm text-stone-400 text-center mt-2">All items will be removed.</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-all">
            Keep Items
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all disabled:opacity-60">
            {loading ? "Clearing…" : "Clear Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shipping progress ── */
function ShippingProgress({ subtotal }) {
  const remaining = FREE_SHIPPING_LIMIT - subtotal;
  const pct       = Math.min((subtotal / FREE_SHIPPING_LIMIT) * 100, 100);
  const free      = subtotal >= FREE_SHIPPING_LIMIT;
  return (
    <div className={`rounded-xl px-4 py-3 border ${free?"bg-emerald-50 border-emerald-100":"bg-amber-50 border-amber-100"}`}>
      <div className="flex items-start gap-2 mb-2">
        <Truck className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${free?"text-emerald-600":"text-amber-600"}`} strokeWidth={2} />
        <span className={`text-xs font-semibold leading-tight ${free?"text-emerald-700":"text-amber-700"}`}>
          {free ? "Free shipping applied!" : `Add ₹${remaining} more for free shipping`}
        </span>
      </div>
      <div className="h-1.5 bg-white/70 rounded-full overflow-hidden border border-black/5">
        <div className={`h-full rounded-full transition-all duration-500 ${free?"bg-emerald-500":"bg-amber-500"}`}
          style={{ width:`${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Qty stepper ── */
function QtyBtn({ children, onClick, disabled, size = "md" }) {
  const s = size === "sm"
    ? "w-8 h-8"
    : "w-9 h-9";
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${s} flex items-center justify-center text-stone-500 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-30 transition-colors`}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Cart = () => {
  const navigate = useNavigate();
  const { getAuthHeader, isAuthenticated } = useAuth();
  const { refetch } = useCartCount({ enabled: isAuthenticated });

  const [cart,           setCart]           = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [updatingKey,    setUpdatingKey]    = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing,       setClearing]       = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await API.get("/api/cart", { headers: getAuthHeader() });
      const normalized = (data.items || []).map((i) => ({
        ...i,
        variantIndex: i.variantIndex ??
          i.product?.variants?.findIndex((v) => v.weight === i.variant?.weight) ?? 0,
      }));
      setCart(normalized);
    } finally { setLoading(false); }
  }, [isAuthenticated, getAuthHeader]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const subtotal = useMemo(
    () => cart.reduce((s, item) => s + getItemPrice(item) * item.quantity, 0), [cart]
  );

  const updateQuantity = useCallback(async (productId, weight, qty) => {
    if (qty < 1 || qty > MAX_QTY) return;
    const key = `${productId}-${weight}`;
    setUpdatingKey(key);
    try {
      await API.patch("/api/cart/update",
        { productId, weight, quantity: qty,
          variantIndex: cart.find(i => i.product._id===productId && i.variant.weight===weight)?.variantIndex },
        { headers: getAuthHeader() });
      setCart(prev => prev.map(i =>
        i.product._id===productId && i.variant.weight===weight ? {...i, quantity:qty} : i));
      refetch?.();
    } finally { setUpdatingKey(null); }
  }, [cart, getAuthHeader, refetch]);

  const removeItem = useCallback(async (productId, weight) => {
    const key = `${productId}-${weight}`;
    setUpdatingKey(key);
    try {
      await API.delete(`/api/cart/remove/${productId}`, {
        headers: getAuthHeader(),
        data: { weight, variantIndex: cart.find(i=>i.product._id===productId && i.variant.weight===weight)?.variantIndex },
      });
      setCart(prev => prev.filter(i => !(i.product._id===productId && i.variant.weight===weight)));
      refetch?.(); emitCartUpdate();
    } finally { setUpdatingKey(null); }
  }, [cart, getAuthHeader, refetch]);

  const clearCart = useCallback(async () => {
    setClearing(true);
    try {
      await API.delete("/api/cart/clear", { headers: getAuthHeader() });
      setCart([]); refetch?.(); emitCartUpdate(); setShowClearModal(false);
    } finally { setClearing(false); }
  }, [getAuthHeader, refetch]);

  /* ── Gate states ── */
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
        <ShoppingBag className="w-7 h-7 text-amber-600" strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-lg font-black text-stone-900">Sign in to view your cart</p>
        <p className="text-sm text-stone-400 mt-1">Your items are saved — just sign in to continue.</p>
      </div>
      <Link to="/login" className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-600/25 transition-all">
        Sign In <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-stone-50"><CartSkeleton /></div>;

  if (!cart.length) return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
        <ShoppingBag className="w-7 h-7 text-stone-400" strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-lg font-black text-stone-800">Your cart is empty</p>
        <p className="text-sm text-stone-400 mt-1">Browse our products and add something delicious.</p>
      </div>
      <Link to="/products" className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-600/25 transition-all">
        Shop Now <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-stone-50 pb-28 md:pb-16">

      {showClearModal && (
        <ClearModal onClose={() => setShowClearModal(false)} onConfirm={clearCart} loading={clearing} />
      )}

      {/* Header */}
      <div className="relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#431407 0%,#7c2d12 50%,#c2410c 100%)" }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"180px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/70 font-bold mb-2">My Cart</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Shopping Cart</h1>
          <p className="text-white/50 text-sm mt-1">{cart.length} item{cart.length!==1?"s":""}</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-5">

        {/* ══ ITEMS ══ */}
        <div className="lg:col-span-2 space-y-3">

          {/* Desktop column headers */}
          <div className="hidden md:grid grid-cols-[1fr_70px_112px_70px] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
            <span>Product</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-stone-100">
            {cart.map((item) => {
              const { product, variant, quantity } = item;
              const key      = `${product._id}-${variant.weight}`;
              const updating = updatingKey === key;
              const price    = getItemPrice(item);
              const lineTotal = price * quantity;

              return (
                <div key={key}
                  className={`px-4 sm:px-5 transition-opacity duration-200 ${updating ? "opacity-40 pointer-events-none" : ""}`}>

                  {/* ── MOBILE (< md) ── */}
                  <div className="md:hidden py-4 flex gap-3">
                    <Link to={`/products/${product._id}`}
                      className="w-[68px] h-[68px] rounded-xl border border-stone-100 bg-stone-50 overflow-hidden flex items-center justify-center shrink-0">
                      <SafeImage src={product.image} alt={product.name}
                        className="w-full h-full object-contain p-1.5" />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800 leading-snug line-clamp-2">
                        {product.name}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500">
                        {variant.weight}
                      </span>

                      <div className="flex items-center justify-between mt-2.5 gap-2">
                        <p className="text-base font-black text-stone-900">
                          ₹{lineTotal.toLocaleString("en-IN")}
                        </p>

                        {/* Stepper */}
                        <div className="flex items-center rounded-xl border border-stone-200 overflow-hidden bg-white shadow-sm">
                          <QtyBtn size="sm" disabled={quantity<=1}
                            onClick={()=>updateQuantity(product._id,variant.weight,quantity-1)}>
                            <Minus className="w-3 h-3" />
                          </QtyBtn>
                          <span className="w-8 h-8 flex items-center justify-center text-xs font-black text-stone-800 border-x border-stone-200">
                            {updating
                              ? <span className="w-3 h-3 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                              : quantity}
                          </span>
                          <QtyBtn size="sm" disabled={quantity>=MAX_QTY}
                            onClick={()=>updateQuantity(product._id,variant.weight,quantity+1)}>
                            <Plus className="w-3 h-3" />
                          </QtyBtn>
                        </div>
                      </div>

                      <button onClick={()=>removeItem(product._id,variant.weight)}
                        className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* ── DESKTOP (≥ md) ── */}
                  <div className="hidden md:grid grid-cols-[1fr_70px_112px_70px] items-center gap-4 py-5">
                    {/* Product */}
                    <div className="flex items-center gap-4 min-w-0">
                      <Link to={`/products/${product._id}`}
                        className="w-[70px] h-[70px] rounded-xl border border-stone-100 bg-stone-50 overflow-hidden flex items-center justify-center shrink-0 hover:border-orange-200 transition-colors">
                        <SafeImage src={product.image} alt={product.name}
                          className="w-full h-full object-contain p-1.5" />
                      </Link>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-stone-800 truncate">{product.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500">
                          {variant.weight}
                        </span>
                        <button onClick={()=>removeItem(product._id,variant.weight)}
                          className="flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="text-center text-sm font-semibold text-stone-600">
                      ₹{price}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center rounded-xl border border-stone-200 overflow-hidden bg-white shadow-sm">
                        <QtyBtn disabled={quantity<=1}
                          onClick={()=>updateQuantity(product._id,variant.weight,quantity-1)}>
                          <Minus className="w-3.5 h-3.5" />
                        </QtyBtn>
                        <span className="w-10 h-9 flex items-center justify-center text-sm font-black text-stone-800 border-x border-stone-200">
                          {updating
                            ? <span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                            : quantity}
                        </span>
                        <QtyBtn disabled={quantity>=MAX_QTY}
                          onClick={()=>updateQuantity(product._id,variant.weight,quantity+1)}>
                          <Plus className="w-3.5 h-3.5" />
                        </QtyBtn>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="text-right text-sm font-black text-stone-900">
                      ₹{lineTotal.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-1">
            <button onClick={()=>setShowClearModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all items
            </button>
          </div>
        </div>

        {/* ══ ORDER SUMMARY ══ */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 sm:p-6 lg:sticky lg:top-20 space-y-4">

            <h3 className="text-base font-black text-stone-900">Order Summary</h3>

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal ({cart.length} item{cart.length!==1?"s":""})</span>
                <span className="font-semibold text-stone-700">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>Shipping</span>
                <span className={`font-semibold ${subtotal>=FREE_SHIPPING_LIMIT?"text-emerald-600":"text-stone-700"}`}>
                  {subtotal>=FREE_SHIPPING_LIMIT ? "Free" : "At checkout"}
                </span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>Tax</span>
                <span className="font-semibold text-stone-700">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-3 border-t border-stone-100">
              <span className="text-sm font-bold text-stone-700">Total</span>
              <span className="text-xl font-black text-stone-900">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <ShippingProgress subtotal={subtotal} />

            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <Package className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={2} />
              <p className="text-xs text-stone-500">
                Estimated by <span className="font-bold text-stone-700">{getEstimatedDelivery()}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer group">
              <Tag className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 transition-colors shrink-0" />
              <span className="text-xs font-medium text-stone-400 group-hover:text-amber-700 transition-colors">
                Add a promo code
              </span>
            </div>

            {/* Desktop CTA only */}
            <button onClick={()=>navigate("/checkout")}
              className="hidden md:flex w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all active:scale-[0.99]">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="hidden md:flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[11px] text-stone-400">Secure · 256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE STICKY CTA ══ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
          <div className="shrink-0">
            <p className="text-[10px] text-stone-400 font-medium leading-none mb-0.5">Total</p>
            <p className="text-base font-black text-stone-900 leading-none">
              ₹{subtotal.toLocaleString("en-IN")}
            </p>
          </div>
          <button onClick={()=>navigate("/checkout")}
            className="flex-1 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all">
            Checkout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div style={{ height:"env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </div>
  );
};

export default Cart;