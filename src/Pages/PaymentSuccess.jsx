import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "@/api";
import Lottie from "lottie-react";
import successAnimation from "@/assets/success.json";
import {
  CheckCircle2,
  Package,
  MapPin,
  ArrowRight,
  Home,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Leaf,
  Copy,
  Check,
} from "lucide-react";

const fmt = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v || 0);

/* ── copy hook ── */
function useCopy(text) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return [copied, copy];
}

/* ═══════════════════════════════════════════
   PAYMENT SUCCESS
═══════════════════════════════════════════ */
const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const shortId = order?._id?.slice(-8).toUpperCase() ?? "";
  const [copiedId, copyId] = useCopy(order?._id ?? "");

  useEffect(() => {
    document.title = "Payment Successful | Achwani";
    const load = async () => {
      try {
        const res = await API.get(`/api/orders/${orderId}`);
        const data = res.data?.data;
        if (!data || data.paymentStatus !== "paid") throw new Error("Payment not confirmed");
        setOrder(data);
      } catch {
        setError("Payment verification failed.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  /* ── states ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-sm text-stone-500 font-medium">Confirming your payment…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="font-bold text-stone-800">Payment Verification Failed</p>
          <p className="text-sm text-stone-400 mt-1">
            Don't worry — if money was deducted, it will be refunded within 5–7 business days.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/orders")}
            className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-sm transition-all">
            My Orders
          </button>
          <Link to="/contact"
            className="h-10 px-5 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-all flex items-center">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  const { address } = order;

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-stone-50 pb-16">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #431407, #c2410c)" }}>
            <Leaf className="w-3 h-3 text-amber-300" strokeWidth={2} />
          </div>
          <span className="font-black text-stone-900 text-sm">Achwani</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">

        {/* ── Success hero card ── */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Green top stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />

          <div className="px-6 pt-6 pb-5 text-center">
            {/* Lottie / fallback icon */}
            <div className="flex justify-center mb-3">
              {successAnimation ? (
                <Lottie animationData={successAnimation} loop={false} className="w-28 h-28" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={1.8} />
                </div>
              )}
            </div>

            <h1 className="text-2xl font-black text-stone-900">Payment Successful!</h1>
            <p className="text-sm text-stone-400 mt-1.5 leading-relaxed">
              Your order is confirmed and is being prepared for dispatch.
            </p>

            {/* Amount pill */}
            <div className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-base font-black text-emerald-700">{fmt(order.totalAmount)} Paid</span>
            </div>
          </div>

          {/* Order info rows */}
          <div className="border-t border-stone-100 divide-y divide-stone-50">
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-xs text-stone-400 font-medium">Order ID</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-stone-700">#{shortId}</span>
                <button onClick={copyId} className="text-stone-400 hover:text-stone-600 transition-colors">
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {order.razorpay_payment_id && (
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-xs text-stone-400 font-medium">Payment Ref</span>
                <span className="text-xs font-mono text-stone-500 truncate max-w-[160px]">
                  {order.razorpay_payment_id}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-xs text-stone-400 font-medium">Payment Method</span>
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                {order.paymentMethod ?? "Razorpay"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Delivery address card ── */}
        {address && (
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-3">
              Delivering to
            </p>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-800">{address.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{address.phone}</p>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                  {address.city}, {address.state} – {address.pincode}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Items summary ── */}
        {order.items?.length > 0 && (
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-3">
              Items ordered
            </p>
            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-stone-100 bg-stone-50 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-stone-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-700 truncate">{item.product?.name}</p>
                    <p className="text-xs text-stone-400">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-stone-800 shrink-0">
                    {fmt(item.priceAtPurchase * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── What's next info ── */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 mb-2.5">
            What happens next?
          </p>
          <div className="space-y-2">
            {[
              "Your order is now being packed by our team.",
              "You'll receive an email once it's dispatched.",
              "Track your shipment live from My Orders.",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <button
            onClick={() => navigate(`/order/${order._id}`)}
            className="flex-1 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all active:scale-[0.99]"
          >
            <Package className="w-4 h-4" />
            Track Order
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/"
            className="flex-1 h-12 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-50 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* ── Browse more ── */}
        <div className="text-center pb-4">
          <Link to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-600 transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;