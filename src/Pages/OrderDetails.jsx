import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "@/Hooks/useAuth";
import { trackShipment } from "@/api/shipping";
import OrderTimeline from "@/Components/OrderTimeline";

const OrderDetails = () => {
  const { id } = useParams();
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!order?.shipping?.awb) return;

    const fetchTracking = async () => {
      const res = await trackShipment(order._id);
      setTracking(res.data.tracking);
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 15000);
    return () => clearInterval(interval);
  }, [order]);

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

  const rawStatus =
    tracking?.current_status || order.shipping?.status || order.orderStatus;

  const shippingStatus = rawStatus.toUpperCase();
  const heroItem = order.items?.[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-orange-700 to-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link to="/orders" className="text-sm opacity-90">
            ← Back to Orders
          </Link>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Order #{order._id.slice(-8)}
              </h1>
              <p className="mt-1 opacity-90">
                Total: <b>₹{order.totalAmount}</b>
              </p>
            </div>

            <span className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
              {shippingStatus}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={async () => {
                const res = await API.get(
                  `/api/orders/${order._id}/invoice`,
                  {
                    headers: getAuthHeader(),
                    responseType: "blob",
                  }
                );

                const url = URL.createObjectURL(
                  new Blob([res.data], { type: "application/pdf" })
                );
                window.open(url, "_blank");
              }}
              className="bg-white text-black px-5 py-2 rounded-full font-semibold text-sm"
            >
              Download Invoice
            </button>

            {order.shipping?.trackingUrl && (
              <a
                href={order.shipping.trackingUrl}
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

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-4 mt-10 grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* TIMELINE */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <OrderTimeline status={rawStatus.toLowerCase()} />
          </div>

          {/* ADDRESS */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
            <p className="text-sm">{order.address.name}</p>
            <p className="text-sm">{order.address.phone}</p>
            <p className="text-sm text-gray-600">
              {order.address.line1}, {order.address.city},{" "}
              {order.address.state} – {order.address.pincode}
            </p>
          </div>

          {/* ITEMS */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Items</h3>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <SafeImage
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-14 h-14 rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × ₹{item.priceAtPurchase}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-sm">
                    ₹{item.quantity * item.priceAtPurchase}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-8">
          {/* PRODUCT */}
          {heroItem && (
            <div className="bg-white rounded-2xl p-6 shadow text-center">
              <SafeImage
                src={heroItem.product?.image}
                alt={heroItem.product?.name}
                className="w-40 mx-auto"
              />
              <p className="mt-3 font-medium text-sm">
                {heroItem.product?.name}
              </p>
            </div>
          )}

          {/* PAYMENT */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Payment</h3>
            <p className="text-sm">
              Method: <b>{order.paymentMethod}</b>
            </p>
            <p className="text-sm mt-1">
              Amount: <b>₹{order.totalAmount}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
