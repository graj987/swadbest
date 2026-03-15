import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "../Hooks/useAuth";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  AlertCircle,
  CreditCard,
} from "lucide-react";

/* ─────────────────────────────────────────────
   STATUS HELPERS
───────────────────────────────────────────── */
const SHIPPING_CONFIG = {
  created:          { label: "Packed",           color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200",  dot: "bg-violet-500",  Icon: Package      },
  shipped:          { label: "Picked Up",        color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-500",   Icon: Truck        },
  in_transit:       { label: "In Transit",       color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-500",   Icon: Truck        },
  out_for_delivery: { label: "Out for Delivery", color: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200",  dot: "bg-orange-500",  Icon: Truck        },
  delivered:        { label: "Delivered",        color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
  cancelled:        { label: "Cancelled",        color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     dot: "bg-red-500",     Icon: XCircle      },
  rto:              { label: "Returned",         color: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200",    dot: "bg-rose-500",    Icon: RotateCcw    },
  processing:       { label: "Processing",       color: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-200",     dot: "bg-sky-500",     Icon: Clock        },
};

const PAYMENT_CONFIG = {
  paid:      { label: "Paid",    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  initiated: { label: "Pending", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   },
  pending:   { label: "Pending", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   },
  failed:    { label: "Failed",  color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200"     },
};

function getShippingCfg(status) {
  return SHIPPING_CONFIG[status?.toLowerCase()] ?? SHIPPING_CONFIG.processing;
}
function getPaymentCfg(status) {
  return PAYMENT_CONFIG[status?.toLowerCase()] ?? { label: status ?? "—", color: "text-stone-600", bg: "bg-stone-100", border: "border-stone-200" };
}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white border border-stone-100 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-stone-200 rounded-full" />
          <div className="h-3 w-24 bg-stone-200 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-stone-200 rounded-full" />
          <div className="h-6 w-20 bg-stone-200 rounded-full" />
        </div>
      </div>
      <div className="flex gap-4 pt-2">
        <div className="w-16 h-16 bg-stone-200 rounded-xl" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 bg-stone-200 rounded-full" />
          <div className="h-3 w-1/2 bg-stone-200 rounded-full" />
        </div>
      </div>
      <div className="flex justify-between pt-2 border-t border-stone-100">
        <div className="h-5 w-24 bg-stone-200 rounded-full" />
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-stone-200 rounded-xl" />
          <div className="h-9 w-24 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CANCEL CONFIRM MODAL
───────────────────────────────────────────── */
function CancelModal({  onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-100 p-7 w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.8} />
          </div>
        </div>
        <h3 className="text-lg font-black text-stone-900 text-center">Cancel Order?</h3>
        <p className="text-sm text-stone-400 text-center mt-2 leading-relaxed">
          This action cannot be undone. Your order will be cancelled and a refund (if applicable) will be processed.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-all"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-sm shadow-red-500/20 disabled:opacity-60"
          >
            {loading ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Orders = () => {
  const navigate = useNavigate();
  const { getAuthHeader, logout } = useAuth();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/api/orders/my", { headers: getAuthHeader() });
        setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        if (err.response?.status === 401) { logout(); navigate("/login"); }
        setError(err.response?.data?.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [getAuthHeader, logout, navigate]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await API.put(`/api/orders/cancel/${cancelTarget}`, {}, { headers: getAuthHeader() });
      setOrders((prev) => prev.filter((o) => o._id !== cancelTarget));
      setCancelTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to cancel. It may already be shipped.");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-stone-50">

      {/* Cancel modal */}
      {cancelTarget && (
        <CancelModal
          orderId={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancel}
          loading={cancelling}
        />
      )}

      {/* ══════ HERO HEADER ══════ */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #431407 0%, #7c2d12 50%, #c2410c 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/70 font-bold mb-2">
            My Account
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Your Orders</h1>
          <p className="text-white/50 text-sm mt-1.5">
            {!loading && !error && `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
          </p>
        </div>
      </div>

      {/* ══════ BODY ══════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Loading */}
        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-stone-600 font-semibold">{error}</p>
            <button onClick={() => window.location.reload()}
              className="text-sm font-bold text-amber-700 hover:text-amber-600 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-amber-600" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-lg font-black text-stone-800">No orders yet</p>
              <p className="text-sm text-stone-400 mt-1">Looks like you haven't placed any orders.</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-600/25 transition-all"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Order list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => {
              const shippingStatus = order.shipping?.awb ? order.shipping.status : "processing";
              const shipCfg  = getShippingCfg(shippingStatus);
              const payCfg   = getPaymentCfg(order.paymentStatus);
              const ShipIcon = shipCfg.Icon;
              const isFinal  = ["delivered", "cancelled", "rto"].includes(shippingStatus?.toLowerCase());

              return (
                <div
                  key={order._id}
                  className="bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* ── Card header ── */}
                  <div className="px-5 pt-5 pb-4 border-b border-stone-100">
                    <div className="flex flex-wrap items-start justify-between gap-3">

                      {/* Order meta */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
                            Order
                          </p>
                          <span className="font-mono text-xs font-bold text-stone-600">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">{formatDate(order.createdAt)}</p>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Payment */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${payCfg.bg} ${payCfg.color} ${payCfg.border}`}>
                          <CreditCard className="w-3 h-3" />
                          {payCfg.label}
                        </span>

                        {/* Shipping */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${shipCfg.bg} ${shipCfg.color} ${shipCfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${shipCfg.dot} ${!isFinal ? "animate-pulse" : ""}`} />
                          <ShipIcon className="w-3 h-3" />
                          {shipCfg.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Shipping info strip ── */}
                  {order.shipping?.awb && (
                    <div className="mx-5 mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-amber-700 shrink-0" strokeWidth={2} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/70">AWB</p>
                          <p className="text-xs font-mono font-bold text-amber-900">{order.shipping.awb}</p>
                        </div>
                      </div>
                      {order.shipping.courierName && (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                          {order.shipping.courierName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Items ── */}
                  <div className="px-5 pt-4 space-y-3">
                    {Array.isArray(order.items) && order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 border border-stone-100"
                      >
                        <div className="w-14 h-14 rounded-xl border border-stone-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                          <SafeImage
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-stone-800 truncate">{item.product?.name}</p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {item.quantity} × ₹{item.priceAtPurchase?.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <p className="text-sm font-black text-stone-800 shrink-0">
                          ₹{(item.quantity * item.priceAtPurchase).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ── Footer ── */}
                  <div className="px-5 pt-4 pb-5 mt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Total */}
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Order Total</p>
                      <p className="text-lg font-black text-stone-900">
                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">

                      {/* Track — internal route */}
                      {order.shipping?.awb && (
                        <Link
                          to={`/track/${order.shipping.awb}`}
                          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm shadow-amber-600/20 transition-all"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Track
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </Link>
                      )}
                      <Link
                        to={`/order/${order._id}`}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 transition-all"
                      >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {/* Pay Now */}
                      {order.paymentStatus === "initiated" && (
                        <button
                          onClick={() => navigate(`/paynow/${order._id}`)}
                          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Now
                        </button>
                      )}

                      {/* Cancel */}
                      {order.orderStatus === "placed" && !order.shipping?.shipmentId && (
                        <button
                          onClick={() => setCancelTarget(order._id)}
                          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;