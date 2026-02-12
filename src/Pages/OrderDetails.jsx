import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "@/Hooks/useAuth";
import { trackShipment } from "@/api/shipping";
import OrderTimeline from "@/Components/OrderTimeline";

/* ---------------- STATUS FORMATTER ---------------- */

const readableStatus = (status) => {
  if (!status) return "Processing";

  status = status.toLowerCase();

  if (status.includes("created")) return "Order Packed";
  if (status.includes("shipped")) return "Picked Up";
  if (status.includes("transit")) return "In Transit";
  if (status.includes("out_for_delivery")) return "Out for Delivery";
  if (status.includes("delivered")) return "Delivered";
  if (status.includes("rto")) return "Returned";
  if (status.includes("cancel")) return "Cancelled";

  return "Processing";
};

const OrderDetails = () => {
  const { id } = useParams();
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ORDER ---------------- */

  const fetchOrder = useCallback(async () => {
    try {
      const res = await API.get(`/api/orders/${id}`, {
        headers: getAuthHeader(),
      });
      setOrder(res.data?.data || null);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeader, logout, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  /* ---------------- FETCH TRACKING (BY AWB) ---------------- */

  useEffect(() => {
    if (!order?.shipping?.awb) return;

    const fetchTracking = async () => {
      try {
        const res = await trackShipment(order.shipping.awb); // ✅ correct identifier
        setTracking(res.data?.data || null);
      } catch {
        console.warn("Tracking not available yet");
      }
    };

    fetchTracking();

    const interval = setInterval(fetchTracking, 20000);
    return () => clearInterval(interval);
  }, [order?.shipping?.awb]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Order not found
      </div>
    );
  }

  /* ---------------- DETERMINE SHIPPING STATUS ---------------- */

  const rawStatus =
    tracking?.tracking_data?.shipment_track?.[0]?.current_status ||
    order.shipping?.status ||
    "processing";

  const shippingStatus = readableStatus(rawStatus);
  const heroItem = order.items?.[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-700 to-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link to="/orders" className="text-sm opacity-90">
            ← Back to Orders
          </Link>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Order #{order._id.slice(-8)}
              </h1>
              <p className="mt-1 opacity-90">
                Total: <b>₹{order.totalAmount}</b>
              </p>
            </div>

            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
              {shippingStatus}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={async () => {
                const res = await API.get(
                  `/api/orders/${order._id}/invoice`,
                  { headers: getAuthHeader(), responseType: "blob" }
                );

                const url = URL.createObjectURL(
                  new Blob([res.data], { type: "application/pdf" })
                );
                window.open(url, "_blank");
              }}
              className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold"
            >
              Download Invoice
            </button>

            {order.shipping?.awb && (
              <a
                href={`https://shiprocket.co/tracking/${order.shipping.awb}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/40 px-5 py-2 rounded-full text-sm"
              >
                Track Shipment
              </a>
            )}
          </div>
        </div>
      </div>

      {/* SHIPMENT INFO */}
      {order.shipping?.shipmentId && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-2xl p-5 shadow text-sm">
            <p className="font-semibold">
              Shipping Status: {shippingStatus}
            </p>

            {order.shipping?.awb ? (
              <>
                <p>AWB: <b>{order.shipping.awb}</b></p>
                <p>Courier: {order.shipping.courierName || "Assigned"}</p>
              </>
            ) : (
              <p>Your order is ready for courier pickup.</p>
            )}
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 mt-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow">
            <OrderTimeline status={shippingStatus.toLowerCase()} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
            <p>{order.address.name}</p>
            <p>{order.address.phone}</p>
            <p className="text-gray-600">
              {order.address.line1}, {order.address.city},{" "}
              {order.address.state} – {order.address.pincode}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {heroItem && (
            <div className="bg-white rounded-2xl p-6 shadow text-center">
              <SafeImage
                src={heroItem.product?.image}
                alt={heroItem.product?.name}
                className="w-40 mx-auto"
              />
              <p className="mt-3">{heroItem.product?.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
