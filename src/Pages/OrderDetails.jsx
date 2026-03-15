// src/pages/OrderDetails.jsx
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "@/Hooks/useAuth";
import { trackShipment } from "@/api/shipping";
import OrderTimeline from "@/Components/OrderTimeline";
import {
  RefreshCw, ArrowLeft, MapPin, Phone, Package,
  Clock, CheckCircle2, XCircle, Truck, RotateCcw,
} from "lucide-react";

const readableStatus = (status) => {
  if (!status) return "Processing";
  const s = status.toLowerCase();
  if (s.includes("created"))           return "Packed";
  if (s.includes("shipped"))          return "Picked Up";
  if (s.includes("transit"))          return "In Transit";
  if (s.includes("out_for_delivery")) return "Out for Delivery";
  if (s.includes("delivered"))        return "Delivered";
  if (s.includes("rto"))              return "Returned";
  if (s.includes("cancel"))          return "Cancelled";
  return "Processing";
};

const FINAL_STATUSES = ["Delivered", "Returned", "Cancelled"];

const statusConfig = {
  "Processing":       { color:"text-sky-700",    bg:"bg-sky-50",    border:"border-sky-200",    dot:"bg-sky-500",     Icon:Clock        },
  "Packed":           { color:"text-violet-700",  bg:"bg-violet-50", border:"border-violet-200", dot:"bg-violet-500",  Icon:Package      },
  "Picked Up":        { color:"text-amber-700",   bg:"bg-amber-50",  border:"border-amber-200",  dot:"bg-amber-500",   Icon:Truck        },
  "In Transit":       { color:"text-amber-700",   bg:"bg-amber-50",  border:"border-amber-200",  dot:"bg-amber-500",   Icon:Truck        },
  "Out for Delivery": { color:"text-orange-700",  bg:"bg-orange-50", border:"border-orange-200", dot:"bg-orange-500",  Icon:Truck        },
  "Delivered":        { color:"text-emerald-700", bg:"bg-emerald-50",border:"border-emerald-200",dot:"bg-emerald-500", Icon:CheckCircle2 },
  "Returned":         { color:"text-rose-700",    bg:"bg-rose-50",   border:"border-rose-200",   dot:"bg-rose-500",    Icon:RotateCcw    },
  "Cancelled":        { color:"text-red-700",     bg:"bg-red-50",    border:"border-red-200",    dot:"bg-red-500",     Icon:XCircle      },
};

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-stone-200 rounded-lg ${className}`} />;
}
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="h-14 bg-white border-b border-stone-100" />
      <div className="h-36 bg-stone-200 animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
function Card({ children, className = "" }) {
  return <div className={`bg-white border border-stone-100 rounded-2xl shadow-sm ${className}`}>{children}</div>;
}
function SectionTitle({ children }) {
  return <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-4">{children}</h3>;
}
const fmt = (v) => `₹${(v || 0).toLocaleString("en-IN")}`;

const OrderDetails = () => {
  const { id }                    = useParams();
  const { getAuthHeader, logout } = useAuth();
  const navigate                  = useNavigate();

  const [order,      setOrder]      = useState(null);
  const [tracking,   setTracking]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await API.get(`/api/orders/${id}`, { headers: getAuthHeader() });
      // FIX: safely handle both res.data.data and res.data
      setOrder(res.data?.data || res.data || null);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate("/login"); }
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeader, logout, navigate]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const rawStatus = useMemo(() => (
    tracking?.tracking_data?.shipment_track?.[0]?.current_status ||
    order?.shipping?.status ||
    "processing"
  ), [tracking, order]);

  const shippingStatus = useMemo(() => readableStatus(rawStatus), [rawStatus]);
  const isFinal        = useMemo(() => FINAL_STATUSES.includes(shippingStatus), [shippingStatus]);

  useEffect(() => {
    if (!order?.shipping?.awb || isFinal) return;
    const fetchTracking = async () => {
      try {
        setRefreshing(true);
        const res = await trackShipment(order.shipping.awb);
        // FIX: trackShipment wraps response — unwrap correctly
        setTracking(res.data?.data || res.data || null);
      } catch { /* silent */ }
      finally { setRefreshing(false); }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 15000);
    return () => clearInterval(interval);
  }, [order?.shipping?.awb, isFinal]);

  if (loading) return <PageSkeleton />;

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <Package className="w-12 h-12 text-stone-300" />
        <p className="text-stone-500 font-medium">Order not found</p>
        <Link to="/orders" className="text-sm text-amber-700 font-semibold hover:underline">← Back to Orders</Link>
      </div>
    );
  }

  const cfg        = statusConfig[shippingStatus] ?? statusConfig["Processing"];
  const StatusIcon = cfg.Icon;
  const heroItem   = order.items?.[0];

  // FIX: use live Shiprocket activities first, fallback to DB trackHistory
  const history =
    tracking?.tracking_data?.shipment_track_activities ||
    order?.shipping?.trackHistory ||
    [];

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "";

  return (
    <div className="min-h-screen bg-stone-50 pb-20">

      {/* TOP BAR */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Orders
          </Link>
          <div className="flex items-center gap-2">
            {refreshing && <RefreshCw className="w-3.5 h-3.5 text-stone-400 animate-spin" />}
            <span className="text-xs text-stone-400 font-mono">#{order._id.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* HERO STRIPE */}
      <div className="relative overflow-hidden" style={{ background:"linear-gradient(135deg,#431407 0%,#9a3412 50%,#c2410c 100%)" }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"180px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold mb-2">Order Summary</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">#{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-white/50 text-sm mt-1.5">
              Placed on {formatDate(order.createdAt)}
              {order.items?.length > 0 && ` · ${order.items.length} item${order.items.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              <span className={`w-2 h-2 rounded-full ${cfg.dot} ${!isFinal ? "animate-pulse" : ""}`} />
              {shippingStatus}
            </div>
            <p className="text-white/80 text-sm font-medium">Total <span className="text-white font-black text-lg">{fmt(order.totalAmount)}</span></p>
          </div>
        </div>
      </div>

      {/* BODY GRID */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 grid lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          <Card className="p-6">
            <SectionTitle>Shipment Progress</SectionTitle>
            <OrderTimeline status={shippingStatus.toLowerCase()} />
            {order.shipping?.awb && (
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-stone-400 font-medium">AWB / Tracking ID</p>
                  <p className="text-xs font-mono font-bold text-stone-700 mt-0.5">{order.shipping.awb}</p>
                </div>
                <Link
                  to={`/track/${order.shipping.awb}`}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition-all shadow-sm shadow-amber-600/20"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Track Live
                </Link>
              </div>
            )}
          </Card>

          {history.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Tracking Updates</SectionTitle>
                {refreshing && <RefreshCw className="w-3.5 h-3.5 text-stone-400 animate-spin" />}
              </div>
              <ol className="relative space-y-0">
                {history.map((event, i) => (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < history.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-px bg-stone-100" />}
                    <div className={`relative z-10 mt-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 ${i===0?"bg-amber-500 shadow-md shadow-amber-500/30":"bg-stone-100 border border-stone-200"}`}>
                      <div className={`w-2 h-2 rounded-full ${i===0?"bg-white":"bg-stone-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      {/* FIX: live events use event.activity; DB events use event.message */}
                      <p className={`text-sm font-semibold ${i===0?"text-stone-900":"text-stone-600"}`}>
                        {event.activity || event.message || "Update"}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {event.date}{event.location && ` · ${event.location}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          <Card className="p-6">
            <SectionTitle>Delivery Address</SectionTitle>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                <MapPin className="w-4 h-4 text-amber-700" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-stone-800">{order.address?.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Phone className="w-3 h-3" />{order.address?.phone}
                </div>
                {/* FIX: support both address schemas (house/street AND line1/line2) */}
                <p className="text-sm text-stone-500 leading-relaxed mt-1">
                  {order.address?.line1 || order.address?.house}
                  {(order.address?.line2 || order.address?.street) && `, ${order.address?.line2 || order.address?.street}`}
                  <br />{order.address?.city}, {order.address?.state} – {order.address?.pincode}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {heroItem && (
            <Card className="overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-100 p-6 flex items-center justify-center">
                <SafeImage src={heroItem.product?.image} alt={heroItem.product?.name} className="w-36 h-36 object-contain rounded-xl" />
              </div>
              <div className="p-5">
                <SectionTitle>Item</SectionTitle>
                <p className="text-sm font-bold text-stone-800 leading-snug">{heroItem.product?.name}</p>
                {heroItem.variant?.weight && (
                  <span className="inline-block mt-2 text-[11px] font-semibold bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full">
                    {heroItem.variant.weight}
                  </span>
                )}
                {/* FIX: price is priceAtPurchase, not heroItem.price */}
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-400">Qty {heroItem.quantity ?? 1}</span>
                  <span className="text-sm font-black text-stone-800">
                    {fmt((heroItem.priceAtPurchase || heroItem.price || 0) * (heroItem.quantity ?? 1))}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {order.items?.length > 1 && (
            <Card className="p-5">
              <SectionTitle>All Items ({order.items.length})</SectionTitle>
              <ul className="divide-y divide-stone-50">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <SafeImage src={item.product?.image} alt={item.product?.name}
                      className="w-10 h-10 object-contain rounded-lg bg-stone-50 border border-stone-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-700 truncate">{item.product?.name}</p>
                      <p className="text-[11px] text-stone-400">Qty {item.quantity ?? 1}</p>
                    </div>
                    {/* FIX: use priceAtPurchase */}
                    <span className="text-xs font-bold text-stone-700">
                      {fmt((item.priceAtPurchase || item.price || 0) * (item.quantity ?? 1))}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-5">
            <SectionTitle>Price Breakdown</SectionTitle>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>{fmt((order.totalAmount||0) - (order.shippingCharge||0))}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span>
                <span>{(order.shippingCharge||0)>0 ? fmt(order.shippingCharge) : <span className="text-emerald-600 font-semibold">Free</span>}</span>
              </div>
              <div className="flex justify-between font-black text-stone-900 pt-2 border-t border-stone-100 mt-2">
                <span>Total</span><span>{fmt(order.totalAmount)}</span>
              </div>
            </div>
            {order.paymentMethod && (
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400">Payment</span>
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">{order.paymentMethod}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;