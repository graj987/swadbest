import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "@/api";
import useAuth from "../Hooks/useAuth";
import {
  ShieldCheck,
  MapPin,
  Phone,
  Package,
  CreditCard,
  Lock,
  ArrowLeft,
  AlertCircle,
  Leaf,
  ArrowRight,
} from "lucide-react";

const fmt = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v || 0);

/* ── skeleton ── */
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-stone-200 rounded-xl ${className}`} />;
}
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="h-14 bg-white border-b border-stone-100" />
      <div className="max-w-xl mx-auto px-4 pt-8 space-y-5">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAY NOW
═══════════════════════════════════════════ */
const PayNow = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { logout }  = useAuth();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [error,   setError]   = useState("");

  /* ── load order ── */
  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/orders/${orderId}`);
      setOrder(res.data?.data || null);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate("/login"); return; }
      setError(err.response?.status === 404 ? "Order not found." : "Unable to load order.");
    } finally {
      setLoading(false);
    }
  }, [orderId, logout, navigate]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  /* ── razorpay ── */
  const ensureRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const startPayment = async () => {
    if (!order?._id || paying) return;
    if (order.paymentStatus === "paid") { navigate(`/order/${order._id}`); return; }

    try {
      setPaying(true);
      setError("");

      const loaded = await ensureRazorpay();
      if (!loaded) throw new Error("Payment gateway failed to load. Please refresh.");

      const key = import.meta.env.VITE_RZ_KEY_ID;
      const rzRes = await API.post("/api/payments/create-order", { orderId: order._id });
      const razorOrder = rzRes.data?.razorpayOrder;
      if (!rzRes.data?.ok || !razorOrder?.id) throw new Error("Unable to initiate payment.");

      const rzp = new window.Razorpay({
        key,
        order_id:    razorOrder.id,
        amount:      razorOrder.amount,
        currency:    "INR",
        name:        "Achwani",
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        image:       "/favicon.ico",
        prefill: {
          name:    order.address?.name    || "",
          contact: order.address?.phone   || "",
          email:   order.user?.email      || "",
        },
        handler: async (response) => {
          try {
            const verify = await API.post("/api/payments/verify", response);
            navigate(verify.data?.ok ? `/payment-success/${order._id}` : `/order/${order._id}`);
          } catch {
            navigate(`/order/${order._id}`);
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => { setError("Payment was cancelled. You can try again."); setPaying(false); } },
        theme: { color: "#d97706" },
      });

      rzp.on("payment.failed", (r) => {
        setError(r.error?.description || "Payment failed. Please try again.");
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      setError(err.message || "Unable to start payment.");
      setPaying(false);
    }
  };

  /* ── states ── */
  if (loading) return <PageSkeleton />;

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="font-bold text-stone-800">{error || "Order unavailable"}</p>
          <p className="text-sm text-stone-400 mt-1">This order could not be loaded.</p>
        </div>
        <button onClick={() => navigate("/orders")}
          className="h-10 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-sm transition-all">
          Back to Orders
        </button>
      </div>
    );
  }

  const { address } = order;
  const shipping = order.shippingCharge ?? 0;
  const subtotal = (order.totalAmount ?? 0) - shipping;

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-stone-50 pb-24 sm:pb-16">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #431407, #c2410c)" }}>
              <Leaf className="w-3 h-3 text-amber-300" strokeWidth={2} />
            </div>
            <span className="font-black text-stone-900 text-sm">Achwani</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            Secure
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-4">

        {/* ── Page title ── */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-bold">
            Complete Payment
          </p>
          <h1 className="text-xl font-black text-stone-900 mt-0.5">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
        </div>

        {/* ── Delivery address ── */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-3">
            Delivering to
          </p>
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">{address?.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
                <Phone className="w-3 h-3" />
                {address?.phone}
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                {address?.line1}{address?.line2 ? `, ${address.line2}` : ""}<br />
                {address?.city}, {address?.state} – {address?.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* ── Order items ── */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-3">
              Items ({order.items?.length ?? 0})
            </p>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="w-11 h-11 rounded-lg border border-stone-200 bg-white flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-stone-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-black text-stone-800 shrink-0">
                    {fmt(item.priceAtPurchase * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="px-5 py-4 border-t border-stone-100 mt-2 space-y-2">
            <div className="flex justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500">
              <span>Shipping</span>
              <span>{shipping > 0 ? fmt(shipping) : <span className="text-emerald-600 font-semibold">Free</span>}</span>
            </div>
            <div className="flex justify-between font-black text-stone-900 text-base pt-2 border-t border-stone-100">
              <span>Total Payable</span>
              <span>{fmt(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* ── Payment method info ── */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200">
          <CreditCard className="w-4 h-4 text-stone-500 shrink-0" />
          <p className="text-xs text-stone-500 leading-relaxed">
            Secured by <span className="font-bold text-stone-700">Razorpay</span> · Accepts UPI, Cards, Net Banking & Wallets
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 font-medium leading-snug">{error}</p>
          </div>
        )}

        {/* ── Desktop CTA ── */}
        <div className="hidden sm:block">
          <button
            onClick={startPayment}
            disabled={paying}
            className={`
              w-full h-13 rounded-xl text-sm font-bold flex items-center justify-center gap-2
              transition-all duration-200
              ${paying
                ? "bg-amber-400/60 text-white cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 hover:shadow-amber-500/30 active:scale-[0.99]"}
            `}
            style={{ height: "52px" }}
          >
            {paying ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
            ) : (
              <><Lock className="w-4 h-4" /> Pay {fmt(order.totalAmount)} Securely <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs text-stone-400">256-bit SSL encrypted · Your data is safe</p>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-4 py-3"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
        <button
          onClick={startPayment}
          disabled={paying}
          className={`
            w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2
            transition-all duration-200
            ${paying
              ? "bg-amber-400/60 text-white cursor-not-allowed"
              : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 active:scale-[0.99]"}
          `}
        >
          {paying ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
          ) : (
            <><Lock className="w-4 h-4" /> Pay {fmt(order.totalAmount)} Securely</>
          )}
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <p className="text-[10px] text-stone-400">256-bit SSL · Powered by Razorpay</p>
        </div>
      </div>
    </div>
  );
};

export default PayNow;