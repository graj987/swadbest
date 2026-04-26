// src/pages/OrderDetails.jsx
import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "@/Hooks/useAuth";
import { trackShipment } from "@/api/shipping";
import OrderTimeline from "@/Components/OrderTimeline";
import {
  RefreshCw,
  ArrowLeft,
  MapPin,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  Banknote,
  Download,
  Star,
  RotateCw,
  ChevronRight,
  Boxes,
  CalendarCheck,
  Timer,
  Info,
  Zap,
  Receipt,
} from "lucide-react";

// ─── Status helpers ──────────────────────────────────────────────────────────
const readableShippingStatus = (status) => {
  if (!status) return "Processing";
  const s = status.toLowerCase();
  if (s.includes("created")) return "Packed";
  if (s.includes("shipped")) return "Picked Up";
  if (s.includes("transit")) return "In Transit";
  if (s.includes("out_for_delivery")) return "Out for Delivery";
  if (s.includes("delivered")) return "Delivered";
  if (s.includes("rto")) return "Returned";
  if (s.includes("cancel")) return "Cancelled";
  return "Processing";
};

const FINAL_STATUSES = ["Delivered", "Returned", "Cancelled"];

// ─── Order lifecycle steps ────────────────────────────────────────────────────
const LIFECYCLE_STEPS = [
  { key: "placed", label: "Order Placed", Icon: CheckCircle2 },
  { key: "paid", label: "Payment Confirmed", Icon: ShieldCheck },
  { key: "packed", label: "Packed", Icon: Package },
  { key: "shipped", label: "Shipped", Icon: Truck },
  { key: "ofd", label: "Out for Delivery", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: CheckCircle2 },
];

const CANCEL_STEP = { key: "cancelled", label: "Cancelled", Icon: XCircle };
const RETURN_STEP = {
  key: "returned",
  label: "Return Initiated",
  Icon: RotateCcw,
};

const shippingToStep = (s) => {
  const m = {
    Processing: "placed",

    Packed: "packing",

    "Ready for Pickup": "waiting_pickup",

    "Picked Up": "picked_up",

    "In Transit": "transit",

    "Out for Delivery": "ofd",

    Delivered: "delivered",

    Returned: "returned",

    Cancelled: "cancelled",
  };

  return m[s] || "placed";
};

const stepOrder = [
  "placed",
  "paid",
  "packing",
  "waiting_pickup",
  "picked_up",
  "transit",
  "ofd",
  "delivered",
];

const getActiveStepIdx = (shippingStatus, paymentStatus) => {
  const step = shippingToStep(shippingStatus);

  if (step === "cancelled" || step === "returned") {
    return -1;
  }

  const paid =
    paymentStatus?.toLowerCase() === "paid" ||
    paymentStatus?.toLowerCase() === "completed";

  if (!paid) {
    return stepOrder.indexOf("placed");
  }

  if (step === "placed") {
    return stepOrder.indexOf("paid");
  }

  return stepOrder.indexOf(step);
};

// ─── Status configs ───────────────────────────────────────────────────────────
const shippingConfig = {
  Processing: {
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    dot: "bg-sky-500",
    Icon: Clock,
  },
  Packed: {
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
    Icon: Package,
  },
  "Picked Up": {
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    Icon: Truck,
  },
  "In Transit": {
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    Icon: Truck,
  },
  "Out for Delivery": {
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
    Icon: Truck,
  },
  Delivered: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  Returned: {
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
    Icon: RotateCcw,
  },
  Cancelled: {
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    Icon: XCircle,
  },
};

const paymentConfig = {
  Paid: {
    label: "Paid",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    Icon: ShieldCheck,
    emoji: "✅",
  },
  Completed: {
    label: "Paid",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    Icon: ShieldCheck,
    emoji: "✅",
  },
  Pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    Icon: Clock,
    emoji: "⏳",
  },
  Failed: {
    label: "Payment Failed",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    Icon: AlertTriangle,
    emoji: "❌",
  },
  Refunded: {
    label: "Refunded",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    Icon: RotateCcw,
    emoji: "💰",
  },
  COD: {
    label: "Pay on Delivery",
    color: "text-stone-700",
    bg: "bg-stone-100",
    border: "border-stone-200",
    Icon: Banknote,
    emoji: "💵",
  },
};

const orderStatusConfig = {
  confirmed: {
    label: "Confirmed",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  processing: {
    label: "Processing",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  packed: {
    label: "Packed",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  shipped: {
    label: "Shipped",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  returned: {
    label: "Returned",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const fmt = (v) => `₹${(v || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const timeAgo = (d) => {
  if (!d) return null;
  const sec = Math.floor((Date.now() - new Date(d)) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
  return `${Math.floor(sec / 86400)}d ago`;
};

const methodLabel = (m) => {
  if (!m) return "—";
  const map = {
    cod: "Cash on Delivery",
    razorpay: "Razorpay",
    upi: "UPI",
    card: "Card",
    netbanking: "Net Banking",
  };
  return map[m.toLowerCase()] || m;
};

// ─── UI atoms ─────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-stone-200 rounded-xl ${className}`} />
  );
}
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-20">
      <div className="h-14 bg-[#111] border-b border-white/5" />
      <div className="h-44 bg-stone-900 animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 mt-8 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-48 w-full bg-stone-800" />
          <Skeleton className="h-64 w-full bg-stone-800" />
          <Skeleton className="h-36 w-full bg-stone-800" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-80 w-full bg-stone-800" />
          <Skeleton className="h-44 w-full bg-stone-800" />
        </div>
      </div>
    </div>
  );
}
function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-[#141414] border border-white/[0.07] rounded-2xl shadow-xl shadow-black/30 ${className}`}
    >
      {children}
    </div>
  );
}
function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
        {children}
      </h3>
      {action}
    </div>
  );
}
function StatusBadge({ cfg, pulse = false, size = "sm" }) {
  const { Icon, color, bg, border, label } = cfg;
  const sz =
    size === "lg"
      ? "text-sm px-3.5 py-1.5 gap-2"
      : "text-[11px] px-2.5 py-1 gap-1.5";
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border ${color} ${bg} ${border} ${sz}`}
    >
      <Icon className={size === "lg" ? "w-3.5 h-3.5" : "w-3 h-3"} />
      {label}
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse ml-0.5 opacity-70" />
      )}
    </span>
  );
}
function ActionBtn({
  Icon,
  label,
  onClick,
  variant = "ghost",
  className = "",
}) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer";
  const styles = {
    primary:
      "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
    ghost: "bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10",
    green:
      "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {label}
    </button>
  );
}

// ─── Lifecycle Tracker ────────────────────────────────────────────────────────
function LifecycleTracker({
  shippingStatus,
  paymentStatus,
  cancelledAt,
  deliveredAt,
}) {
  const isCancelled = shippingStatus === "Cancelled";
  const isReturned = shippingStatus === "Returned";
  const steps = isCancelled
    ? [...LIFECYCLE_STEPS.slice(0, 2), CANCEL_STEP]
    : isReturned
      ? [...LIFECYCLE_STEPS, RETURN_STEP]
      : LIFECYCLE_STEPS;

  const activeIdx = getActiveStepIdx(shippingStatus, paymentStatus);
  const activeKey = shippingToStep(shippingStatus);

  return (
    <div className="relative">
      <div className="flex flex-col gap-0">
        {steps.map((step, i) => {
          const isActive = step.key === activeKey;
          const isDone =
            !isCancelled &&
            !isReturned &&
            stepOrder.indexOf(step.key) <= activeIdx;
          const isCancelledStep =
            step.key === "cancelled" || step.key === "returned";
          const isLast = i === steps.length - 1;
          const { Icon } = step;

          const iconColor = isActive
            ? isCancelledStep
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
              : "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
            : isDone
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/5 text-stone-600 border border-white/10";

          const textColor = isActive
            ? "text-white font-bold"
            : isDone
              ? "text-stone-400"
              : "text-stone-600";
          const lineColor =
            isDone || isActive ? "bg-amber-500/40" : "bg-white/5";

          return (
            <div key={step.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!isLast && (
                  <div
                    className={`w-px h-8 my-0.5 transition-all ${lineColor}`}
                  />
                )}
              </div>
              <div className="pt-1.5 pb-2 flex-1">
                <p className={`text-sm transition-all ${textColor}`}>
                  {step.label}
                </p>
                {isActive && isActive && (
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {isCancelledStep && cancelledAt
                      ? fmtDateTime(cancelledAt)
                      : isActive && deliveredAt
                        ? fmtDateTime(deliveredAt)
                        : "In progress"}
                  </p>
                )}
              </div>
              {isActive && !isCancelledStep && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
                    Current
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const OrderDetails = () => {
  const { id } = useParams();
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackError, setTrackError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statusChanged, setStatusChanged] = useState(false);
  const prevStatusRef = useRef(null);

  // ── Fetch order ──────────────────────────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    try {
      const res = await API.get(`/api/orders/${id}`, {
        headers: getAuthHeader(),
      });
      setOrder(res.data?.data || res.data || null);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      console.error(
        "[OrderDetails] fetchOrder failed:",
        err.response?.data || err.message,
      );
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeader, logout, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // ── Derived statuses ──────────────────────────────────────────────────────
  const rawStatus = useMemo(
    () =>
      tracking?.tracking_data?.shipment_track?.[0]?.current_status ||
      order?.shipping?.status ||
      "processing",
    [tracking, order],
  );

  const shippingStatus = useMemo(
    () => readableShippingStatus(rawStatus),
    [rawStatus],
  );
  const isFinal = useMemo(
    () => FINAL_STATUSES.includes(shippingStatus),
    [shippingStatus],
  );

  const paymentStatus = useMemo(() => {
    const m = order?.paymentMethod?.toLowerCase();
    const s = order?.paymentStatus;
    if (!s && m === "cod") return "COD";
    return s || "Pending";
  }, [order]);

  const paymentCfg = useMemo(() => {
    const key =
      Object.keys(paymentConfig).find(
        (k) => k.toLowerCase() === paymentStatus.toLowerCase(),
      ) || "Pending";
    return paymentConfig[key];
  }, [paymentStatus]);

  const orderStatusKey = useMemo(
    () => (order?.orderStatus || shippingStatus).toLowerCase(),
    [order, shippingStatus],
  );
  const orderStatusCfg = useMemo(
    () => orderStatusConfig[orderStatusKey] || orderStatusConfig["processing"],
    [orderStatusKey],
  );

  // ── Polling ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!order?.shipping?.awb || isFinal) return;
    const fetchTracking = async () => {
      try {
        setRefreshing(true);
        setTrackError(null);
        const res = await trackShipment(order.shipping.awb);
        const data = res.data?.data || res.data || null;
        setTracking(data);
        const newStatus = readableShippingStatus(
          data?.tracking_data?.shipment_track?.[0]?.current_status || "",
        );
        if (prevStatusRef.current && prevStatusRef.current !== newStatus) {
          setStatusChanged(true);
          setTimeout(() => setStatusChanged(false), 4000);
        }
        prevStatusRef.current = newStatus;
        setLastUpdated(new Date());
      } catch (err) {
        const msg =
          err.response?.data?.message || err.message || "Tracking unavailable";
        setTrackError(msg);
        console.error("[OrderDetails] trackShipment failed:", msg);
      } finally {
        setRefreshing(false);
      }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 15000);
    return () => clearInterval(interval);
  }, [order?.shipping?.awb, isFinal]);

  // ── Loading / not found ───────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center gap-4">
        <Package className="w-12 h-12 text-stone-600" />
        <p className="text-stone-400 font-medium">Order not found</p>
        <Link
          to="/orders"
          className="text-sm text-amber-500 font-semibold hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const cfg = shippingConfig[shippingStatus] ?? shippingConfig["Processing"];
  const heroItem = order.items?.[0];
  const history =
    tracking?.tracking_data?.shipment_track_activities ||
    order?.shipping?.trackHistory ||
    [];

  const isCancelled = shippingStatus === "Cancelled";
  const isReturned = shippingStatus === "Returned";
  const isDelivered = shippingStatus === "Delivered";
  const isShipped = ["Picked Up", "In Transit", "Out for Delivery"].includes(
    shippingStatus,
  );
  const isProcessing = ["Processing", "Packed"].includes(shippingStatus);
  const paymentFailed = paymentStatus?.toLowerCase() === "failed";
  const isRefunded = order?.refundStatus?.toLowerCase() === "refunded";
  const isCOD = order?.paymentMethod?.toLowerCase() === "cod";
  const isOnlineUnpaid = !isCOD && paymentStatus?.toLowerCase() === "pending";

  // Estimated delivery
  const estDelivery =
    order?.shipping?.estimatedDelivery || order?.estimatedDelivery;
  const partner =
    tracking?.tracking_data?.shipment_track?.[0]?.courier_name ||
    order?.shipping?.partner ||
    "—";

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-24 font-sans">
      {/* ── TOP BAR ── */}
      <div className="bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-white/6 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Orders
          </Link>
          <div className="flex items-center gap-3">
            {statusChanged && (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 animate-pulse">
                ⚡ Status Updated
              </span>
            )}
            {refreshing && (
              <RefreshCw className="w-3.5 h-3.5 text-stone-500 animate-spin" />
            )}
            {lastUpdated && !refreshing && (
              <span className="text-[11px] text-stone-600">
                Updated {timeAgo(lastUpdated)}
              </span>
            )}
            <span className="text-xs text-stone-500 font-mono bg-white/5 px-2.5 py-1 rounded-lg">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #1a0800 100%)",
          }}
        />
        {/* grain */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
        {/* amber glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-600/8 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-600/60 font-bold mb-2">
              Order Details
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-stone-500 text-sm mt-2">
              Placed {fmtDate(order.createdAt)}
              {order.items?.length > 0 &&
                ` · ${order.items.length} item${order.items.length > 1 ? "s" : ""}`}
              {isCOD ? " · COD" : " · Prepaid"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${cfg.bg} ${cfg.color} ${cfg.border} ${statusChanged ? "ring-2 ring-amber-400/50 ring-offset-1 ring-offset-transparent" : ""}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${cfg.dot} ${!isFinal ? "animate-pulse" : ""}`}
              />
              {shippingStatus}
            </div>
            <p className="text-stone-400 text-sm font-medium">
              Total{" "}
              <span className="text-white font-black text-xl">
                {fmt(order.totalAmount)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 grid lg:grid-cols-3 gap-5">
        {/* ── LEFT COL ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Status + Payment Status Summary */}
          <Card className="p-5">
            <SectionTitle>Order Intelligence</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Order Status */}
              <div className="bg-white/3 rounded-xl p-4 border border-white/6">
                <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-bold">
                  Order Status
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${orderStatusCfg.color} ${orderStatusCfg.bg} ${orderStatusCfg.border}`}
                  >
                    {orderStatusCfg.label}
                  </span>
                  {isCancelled && order.cancelledAt && (
                    <span className="text-xs text-stone-500">
                      {fmtDate(order.cancelledAt)}
                    </span>
                  )}
                  {isDelivered && order.deliveredAt && (
                    <span className="text-xs text-stone-500">
                      {fmtDate(order.deliveredAt)}
                    </span>
                  )}
                </div>
                {order.cancellationReason && (
                  <p className="text-xs text-stone-500 mt-2 flex items-start gap-1.5">
                    <Info className="w-3 h-3 shrink-0 mt-0.5 text-stone-600" />
                    {order.cancellationReason}
                  </p>
                )}
              </div>

              {/* Payment Status */}
              <div className="bg-white/3 rounded-xl p-4 border border-white/6">
                <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-bold">
                  Payment Status
                </p>
                <StatusBadge
                  cfg={paymentCfg}
                  pulse={paymentStatus?.toLowerCase() === "pending"}
                />
                {isRefunded && (
                  <div className="mt-2">
                    <StatusBadge cfg={paymentConfig["Refunded"]} />
                    {order.refundAmount && (
                      <p className="text-xs text-stone-500 mt-1">
                        {fmt(order.refundAmount)} refunded
                        {order.refundedAt && ` on ${fmtDate(order.refundedAt)}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contextual Actions */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              {isProcessing && (
                <ActionBtn
                  Icon={XCircle}
                  label="Cancel Order"
                  variant="danger"
                  onClick={() => navigate(`/orders/${order._id}/cancel`)}
                />
              )}
              {isDelivered && (
                <>
                  <ActionBtn
                    Icon={RotateCw}
                    label="Reorder"
                    variant="primary"
                    onClick={() => navigate(`/reorder/${order._id}`)}
                  />
                  <ActionBtn
                    Icon={Download}
                    label="Invoice"
                    variant="ghost"
                    onClick={() => navigate(`/orders/${order._id}/invoice`)}
                  />
                  <ActionBtn
                    Icon={Star}
                    label="Review"
                    variant="ghost"
                    onClick={() => navigate(`/orders/${order._id}/review`)}
                  />
                </>
              )}
              {isShipped && order.shipping?.awb && (
                <ActionBtn
                  Icon={Truck}
                  label="Track Shipment"
                  variant="primary"
                  onClick={() => navigate(`/track/${order.shipping.awb}`)}
                />
              )}
              {paymentFailed && (
                <ActionBtn
                  Icon={Zap}
                  label="Retry Payment"
                  variant="primary"
                  onClick={() => navigate(`/payment/retry/${order._id}`)}
                />
              )}
              {isReturned && (
                <ActionBtn
                  Icon={RotateCcw}
                  label="Return Details"
                  variant="ghost"
                  onClick={() => navigate(`/orders/${order._id}/return`)}
                />
              )}
            </div>
          </Card>

          {/* Full Lifecycle Tracker */}
          <Card className="p-5">
            <SectionTitle>Order Progress</SectionTitle>
            <LifecycleTracker
              shippingStatus={shippingStatus}
              paymentStatus={paymentStatus}
              cancelledAt={order.cancelledAt}
              deliveredAt={order.deliveredAt || order.shipping?.deliveredAt}
            />
            {order.shipping?.awb && (
              <div className="mt-6 pt-5 border-t border-white/6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">
                    AWB / Tracking
                  </p>
                  <p className="text-sm font-mono font-bold text-stone-300 mt-0.5">
                    {order.shipping.awb}
                  </p>
                </div>
                <Link
                  to={`/track/${order.shipping.awb}`}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Track Live
                </Link>
              </div>
            )}
          </Card>

          {/* Tracking Updates */}
          {trackError && (
            <Card className="p-5">
              <div className="flex items-center gap-3 text-amber-500/80">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p className="text-sm">Tracking unavailable: {trackError}</p>
              </div>
            </Card>
          )}
          {history.length > 0 && (
            <Card className="p-5">
              <SectionTitle
                action={
                  refreshing ? (
                    <RefreshCw className="w-3.5 h-3.5 text-stone-600 animate-spin" />
                  ) : null
                }
              >
                Tracking Updates
              </SectionTitle>
              <ol className="relative space-y-0">
                {history.map((event, i) => (
                  <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < history.length - 1 && (
                      <div className="absolute left-3.25 top-7 bottom-0 w-px bg-white/6" />
                    )}
                    <div
                      className={`relative z-10 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        i === 0
                          ? "bg-amber-500 border-amber-400 shadow-md shadow-amber-500/20"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${i === 0 ? "bg-black" : "bg-stone-600"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p
                        className={`text-sm ${i === 0 ? "font-semibold text-stone-200" : "text-stone-500"}`}
                      >
                        {event.activity || event.message || "Update"}
                      </p>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {event.date}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {/* Delivery Address */}
          <Card className="p-5">
            <SectionTitle>Delivery Address</SectionTitle>
            <div className="flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                <MapPin className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-stone-200">
                  {order.address?.name}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Phone className="w-3 h-3" />
                  {order.address?.phone}
                </div>
                <p className="text-sm text-stone-500 leading-relaxed mt-1.5">
                  {order.address?.line1 || order.address?.house}
                  {(order.address?.line2 || order.address?.street) &&
                    `, ${order.address?.line2 || order.address?.street}`}
                  <br />
                  {order.address?.city}, {order.address?.state} –{" "}
                  {order.address?.pincode}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          {/* Hero item */}
          {heroItem && (
            <Card className="overflow-hidden">
              <div className="bg-stone-900/60 border-b border-white/5 p-6 flex items-center justify-center">
                <SafeImage
                  src={heroItem.product?.image}
                  alt={heroItem.product?.name}
                  className="w-36 h-36 object-contain rounded-xl"
                />
              </div>
              <div className="p-5">
                <SectionTitle>
                  {order.items?.length > 1
                    ? `Items (${order.items.length})`
                    : "Item"}
                </SectionTitle>

                {/* Always show first item inline */}
                <p className="text-sm font-bold text-stone-200 leading-snug">
                  {heroItem.product?.name}
                </p>
                {heroItem.variant?.weight && (
                  <span className="inline-block mt-2 text-[11px] font-semibold bg-white/5 text-stone-400 px-2.5 py-1 rounded-full border border-white/10">
                    {heroItem.variant.weight}
                  </span>
                )}
                <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    Qty {heroItem.quantity ?? 1}
                  </span>
                  <span className="text-sm font-black text-stone-200">
                    {fmt(
                      (heroItem.priceAtPurchase || heroItem.price || 0) *
                        (heroItem.quantity ?? 1),
                    )}
                  </span>
                </div>

                {/* Extra items */}
                {order.items.length > 1 && (
                  <ul className="mt-3 pt-3 border-t border-white/6 space-y-3">
                    {order.items.slice(1).map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <SafeImage
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-9 h-9 object-contain rounded-lg bg-stone-900 border border-white/6"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-400 truncate">
                            {item.product?.name}
                          </p>
                          <p className="text-[11px] text-stone-600">
                            Qty {item.quantity ?? 1}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-stone-400">
                          {fmt(
                            (item.priceAtPurchase || item.price || 0) *
                              (item.quantity ?? 1),
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          )}

          {/* Order Intelligence Summary */}
          <Card className="p-5">
            <SectionTitle>Shipment Info</SectionTitle>
            <div className="space-y-3">
              {[
                { Icon: Truck, label: "Courier", value: partner },
                {
                  Icon: Package,
                  label: "AWB",
                  value: order.shipping?.awb || "—",
                },
                {
                  Icon: Boxes,
                  label: "Packages",
                  value: order.shipping?.packageCount ?? "1",
                },
                {
                  Icon: CalendarCheck,
                  label: "Est. Delivery",
                  value: estDelivery ? fmtDate(estDelivery) : "—",
                },
                {
                  Icon: Timer,
                  label: "Delivered",
                  value: order.deliveredAt
                    ? fmtDateTime(order.deliveredAt)
                    : "—",
                },
                {
                  Icon: Receipt,
                  label: "Order Type",
                  value: isCOD ? "Cash on Delivery" : "Prepaid",
                },
              ].map(({ Icon: I, label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 text-stone-500">
                    <I className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">{label}</span>
                  </div>
                  <span className="text-xs font-semibold text-stone-300 text-right max-w-[60%] truncate">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Details */}
          <Card className="p-5">
            <SectionTitle>Payment Details</SectionTitle>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Method</span>
                <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-stone-500" />
                  {methodLabel(order.paymentMethod)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Status</span>
                <StatusBadge cfg={paymentCfg} size="xs" />
              </div>
              {order.transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Txn ID</span>
                  <span className="text-[11px] font-mono text-stone-400 truncate max-w-[55%]">
                    {order.transactionId}
                  </span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Paid At</span>
                  <span className="text-xs text-stone-400">
                    {fmtDateTime(order.paidAt)}
                  </span>
                </div>
              )}
              {isRefunded && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Refund</span>
                  <span className="text-xs font-bold text-purple-400">
                    {order.refundAmount ? fmt(order.refundAmount) : "Initiated"}
                  </span>
                </div>
              )}

              {/* COD unpaid notice */}
              {isCOD && !isDelivered && (
                <div className="mt-3 pt-3 border-t border-white/6 bg-amber-500/5 rounded-xl p-3 border border-amber-500/15">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Banknote className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-semibold">Pay on Delivery</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {fmt(order.totalAmount)} due at delivery
                  </p>
                </div>
              )}

              {/* Retry payment */}
              {paymentFailed && (
                <div className="mt-3 pt-3 border-t border-white/6">
                  <ActionBtn
                    Icon={Zap}
                    label="Retry Payment"
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => navigate(`/payment/retry/${order._id}`)}
                  />
                </div>
              )}

              {/* Amount due for online unpaid */}
              {isOnlineUnpaid && !paymentFailed && (
                <>
                  <div className="flex items-center justify-between pt-2 border-t border-white/6">
                    <span className="text-xs text-red-400 font-semibold">
                      Amount Due
                    </span>

                    <span className="text-sm font-black text-red-400">
                      {fmt(order.totalAmount)}
                    </span>
                  </div>

                  <ActionBtn
                    Icon={Zap}
                    label="Pay Now"
                    variant="primary"
                    className="w-full justify-center mt-3"
                    onClick={() => navigate(`/payment/retry/${order._id}`)}
                  />
                </>
              )}
            </div>
          </Card>

          {/* Price Breakdown */}
          <Card className="p-5">
            <SectionTitle>Price Breakdown</SectionTitle>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-500">
                <span className="text-xs">Subtotal</span>
                <span className="text-xs text-stone-300">
                  {fmt((order.totalAmount || 0) - (order.shippingCharge || 0))}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span className="text-xs">Discount</span>
                  <span className="text-xs font-semibold">
                    − {fmt(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span className="text-xs">Shipping</span>
                <span className="text-xs">
                  {(order.shippingCharge || 0) > 0 ? (
                    <span className="text-stone-300">
                      {fmt(order.shippingCharge)}
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-semibold">Free</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between font-black text-white pt-3 border-t border-white/[0.07] mt-1">
                <span className="text-sm">Total</span>
                <span className="text-sm">{fmt(order.totalAmount)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
