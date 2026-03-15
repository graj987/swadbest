// src/pages/OrderConfirmation.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import { toast } from "sonner";
import {
  CheckCircle2,
  MapPin,
  Phone,
  Truck,
  FileDown,
  ArrowRight,
  Package,
  Loader2,
  ExternalLink,
} from "lucide-react";

/* ─────────────────────────────────────────────
   SHIPPING STATUS MESSAGE
───────────────────────────────────────────── */
const shippingMessage = (shipping) => {
  if (!shipping?.shipmentId)            return "Your order has been received and is being prepared.";
  if (shipping.shipmentId && !shipping.awb) return "Your order is packed and awaiting courier pickup.";
  if (shipping.status === "shipped")        return "Your package has been picked up by the courier.";
  if (shipping.status === "in_transit")     return "Your package is on its way to you.";
  if (shipping.status === "out_for_delivery") return "Out for delivery — get ready!";
  if (shipping.status === "delivered")      return "Delivered successfully. Enjoy!";
  return "Processing your shipment.";
};

const fmt = (v) => `₹${(v || 0).toLocaleString("en-IN")}`;

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-stone-200 rounded-xl ${className}`} />;
}

/* ═══════════════════════════════════════════
   ORDER CONFIRMATION
═══════════════════════════════════════════ */
const OrderConfirmation = () => {
  const { orderId }       = useParams();
  const { getAuthHeader } = useAuth();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [dlLoading, setDlLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/api/orders/${orderId}`, {
          headers: getAuthHeader(),
        });
        // ✅ FIX: backend wraps in res.data.data
        setOrder(res.data?.data || res.data || null);
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, getAuthHeader]);

  /* ── invoice download ── */
  const handleInvoice = async () => {
    if (!order?._id) return;
    try {
      setDlLoading(true);
      const res = await API.get(`/api/orders/${order._id}/invoice`, {
        headers:      getAuthHeader(),
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `invoice-${order._id.slice(-8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Invoice not available yet");
    } finally {
      setDlLoading(false);
    }
  };

  /* ── states ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm text-stone-500 font-medium">Loading your order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <Package className="w-12 h-12 text-stone-300" />
        <p className="text-stone-500 font-semibold">Order not found</p>
        <Link to="/orders" className="text-sm text-orange-600 font-bold hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const shipping = order.shipping || {};
  // ✅ FIX: items are at order.items, NOT order.products
  const items    = order.items || [];

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Success hero card ── */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />

          <div className="px-6 py-7 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.8} />
            </div>

            <h1 className="text-2xl font-black text-stone-900">Order Confirmed!</h1>
            <p className="text-sm text-stone-400 mt-1.5">{shippingMessage(shipping)}</p>

            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-stone-100 border border-stone-200">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Order ID</span>
              <span className="font-mono text-xs font-bold text-stone-700">
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ── AWB / Tracking strip ── */}
        {shipping.awb && (
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-amber-700" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">AWB / Tracking</p>
                <p className="text-sm font-mono font-bold text-stone-800">{shipping.awb}</p>
                {shipping.courierName && (
                  <p className="text-xs text-stone-400">{shipping.courierName}</p>
                )}
              </div>
            </div>
            <a
              href={`https://shiprocket.co/tracking/${shipping.awb}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shrink-0"
            >
              Track <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* ── Order items ── */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-1">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-3">
              Items ({items.length})
            </h3>
          </div>

          <div className="px-5 pb-4 space-y-2.5">
            {items.map((item, idx) => {
              // ✅ FIX: items use item.product (populated), price is item.priceAtPurchase
              const name    = item.product?.name     || "Product";
              // ✅ FIX: variant weight is at item.variant.weight
              const weight  = item.variant?.weight   || "";
              const price   = item.priceAtPurchase   || item.variant?.price || 0;
              const qty     = item.quantity           || 1;

              return (
                <div key={item._id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="w-11 h-11 rounded-lg border border-stone-200 bg-white flex items-center justify-center shrink-0">
                    {item.product?.image
                      ? <img src={item.product.image} alt={name} className="w-full h-full object-contain p-1 rounded-lg" />
                      : <Package className="w-5 h-5 text-stone-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-800 truncate">{name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {weight && `${weight} · `}Qty {qty}
                    </p>
                  </div>
                  <p className="text-sm font-black text-stone-800 shrink-0">{fmt(price * qty)}</p>
                </div>
              );
            })}
          </div>

          {/* Price breakdown */}
          <div className="px-5 py-4 border-t border-stone-100 space-y-2">
            <div className="flex justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span>{fmt((order.totalAmount || 0) - (order.shippingCharge || 0))}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500">
              <span>Shipping</span>
              <span>
                {(order.shippingCharge || 0) > 0
                  ? fmt(order.shippingCharge)
                  : <span className="text-emerald-600 font-semibold">Free</span>
                }
              </span>
            </div>
            <div className="flex justify-between font-black text-stone-900 text-base pt-2 border-t border-stone-100">
              <span>Total Paid</span>
              <span>{fmt(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* ── Delivery address ── */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-3">
            Delivery Address
          </h3>
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              {/* ✅ FIX: address fields — house/street not line1/line2 in this model */}
              <p className="text-sm font-bold text-stone-800">{order.address?.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
                <Phone className="w-3 h-3" />
                {order.address?.phone}
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                {order.address?.house || order.address?.line1}
                {(order.address?.street || order.address?.line2) && `, ${order.address?.street || order.address?.line2}`}
                <br />
                {order.address?.city}, {order.address?.state} – {order.address?.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* ── Payment info ── */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Payment</p>
            <p className="text-sm font-bold text-stone-800 mt-0.5 uppercase tracking-wide">
              {order.paymentMethod}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${
            order.paymentStatus === "paid"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : order.paymentStatus === "pending" || order.paymentStatus === "initiated"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {order.paymentStatus?.toUpperCase()}
          </span>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <button
            onClick={handleInvoice}
            disabled={dlLoading}
            className="flex-1 h-12 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-700 flex items-center justify-center gap-2 hover:bg-stone-50 transition-all disabled:opacity-60"
          >
            {dlLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              : <><FileDown className="w-4 h-4" /> Download Invoice</>
            }
          </button>

          <Link
            to="/orders"
            className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all"
          >
            View All Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;