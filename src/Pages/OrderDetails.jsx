import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "@/Hooks/useAuth";
import { trackShipment } from "@/api/shipping";
import OrderTimeline from "@/Components/OrderTimeline";
import { RefreshCw } from "lucide-react";

/* ---------------- STATUS FORMATTER ---------------- */

const readableStatus = (status) => {
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

const OrderDetails = () => {
  const { id } = useParams();
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  /* ---------------- DERIVED STATUS ---------------- */

  const rawStatus = useMemo(() => {
    return (
      tracking?.tracking_data?.shipment_track?.[0]?.current_status ||
      order?.shipping?.status ||
      "processing"
    );
  }, [tracking, order]);

  const shippingStatus = useMemo(
    () => readableStatus(rawStatus),
    [rawStatus]
  );

  const isFinal = useMemo(
    () => FINAL_STATUSES.includes(shippingStatus),
    [shippingStatus]
  );

  /* ---------------- FETCH TRACKING ---------------- */

  useEffect(() => {
    if (!order?.shipping?.awb) return;
    if (isFinal) return;

    let interval;

    const fetchTracking = async () => {
      try {
        setRefreshing(true);
        const res = await trackShipment(order.shipping.awb);
        setTracking(res.data?.data || null);
      } catch {
        console.warn("Tracking not available yet");
      } finally {
        setRefreshing(false);
      }
    };

    fetchTracking();

    interval = setInterval(fetchTracking, 15000);

    return () => clearInterval(interval);
  }, [order?.shipping?.awb, isFinal]);

  /* ---------------- LOADING STATES ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Order not found
      </div>
    );
  }

  const heroItem = order.items?.[0];
  const history =
    tracking?.tracking_data?.shipment_track_activities || [];

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-16">
      
      {/* HERO */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Link to="/orders" className="text-sm opacity-80">
            ← Back to Orders
          </Link>

          <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Order #{order._id.slice(-8)}
              </h1>
              <p className="opacity-90 mt-1">
                Total: <b>₹{order.totalAmount}</b>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {refreshing && (
                <RefreshCw className="animate-spin" size={18} />
              )}
              <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold">
                {shippingStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 mt-10 grid lg:grid-cols-3 gap-8">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <OrderTimeline status={shippingStatus.toLowerCase()} />
          </div>

          {history.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">
                Tracking Updates
              </h3>

              <div className="space-y-4">
                {history.map((event, i) => (
                  <div
                    key={i}
                    className="border-l-2 border-orange-500 pl-4"
                  >
                    <p className="font-medium">
                      {event.activity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {event.date} – {event.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">
              Shipping Address
            </h3>
            <p>{order.address.name}</p>
            <p>{order.address.phone}</p>
            <p className="text-gray-600">
              {order.address.line1}, {order.address.city},{" "}
              {order.address.state} – {order.address.pincode}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-8">
          {heroItem && (
            <div className="bg-white rounded-3xl p-6 shadow-lg text-center hover:shadow-xl transition">
              <SafeImage
                src={heroItem.product?.image}
                alt={heroItem.product?.name}
                className="w-44 mx-auto rounded-xl"
              />
              <p className="mt-4 font-medium">
                {heroItem.product?.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
