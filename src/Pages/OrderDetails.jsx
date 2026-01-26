import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "@/Hooks/useAuth";
import { trackShipment } from "@/api/shipping";

const primaryGradient =
  "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white";

const SHIPPING_STEPS = [
  "placed",
  "preparing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

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
      try {
        const res = await trackShipment(order._id);
        setTracking(res.data.tracking);
      } catch (err) {
        console.error("Tracking error", err);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 15000);
    return () => clearInterval(interval);
  }, [order]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading order…
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order not found
      </div>
    );

  const shippingStatus =
    tracking?.current_status?.toLowerCase() ||
    order.shipping?.status ||
    order.orderStatus;

  const currentIndex = SHIPPING_STEPS.indexOf(shippingStatus);

  return (
    <div className="min-h-screen bg-gray-100 py-8 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6">
        <Link to="/orders" className="text-indigo-600 font-semibold">
          ← Back
        </Link>

        <h2 className="text-3xl font-bold text-center mt-4">Order Tracking</h2>
        <p className="text-center text-gray-500">
          Order #{order._id.slice(-8)}
        </p>

        <div className="mt-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Placed</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded">
            <div
              className="absolute h-2 bg-indigo-600 rounded transition-all"
              style={{
                width:
                  currentIndex <= 1
                    ? "25%"
                    : currentIndex <= 3
                      ? "60%"
                      : "100%",
              }}
            />
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-6 rounded-xl space-y-6">
          <div
            className={`mx-auto px-4 py-2 rounded-full w-fit ${primaryGradient}`}
          >
            {shippingStatus.toUpperCase()}
          </div>

          {order.shipping?.awb && (
            <div className="bg-white p-4 rounded shadow">
              <p>
                Courier: <b>{order.shipping.courierName}</b>
              </p>
              <p>
                AWB: <b>{order.shipping.awb}</b>
              </p>
              <p>
                Status:{" "}
                <b>{tracking?.current_status || order.shipping.status}</b>
              </p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p>{order.address.name}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.line1}</p>
            <p>
              {order.address.city} - {order.address.pincode}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between mb-3">
                <div className="flex gap-4">
                  <SafeImage
                    src={item.product?.image}
                    className="w-14 h-14 rounded"
                  />
                  <div>
                    <p>{item.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × ₹{item.priceAtPurchase}
                    </p>
                  </div>
                </div>
                <p>₹{item.quantity * item.priceAtPurchase}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="flex justify-between">
              Payment: <b>{order.paymentMethod}</b>
            </p>
            <p className="flex justify-between text-lg font-bold">
              Total <span>₹{order.totalAmount}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`/api/orders/${order._id}/invoice`}
              target="_blank"
              className="border px-6 py-2 rounded"
            >
              Invoice 📄
            </a>

            {order.orderStatus === "placed" && (
              <button
                onClick={async () => {
                  if (!window.confirm("Cancel this order?")) return;
                  await API.put(
                    `/api/orders/${order._id}/cancel`,
                    {},
                    { headers: getAuthHeader() },
                  );
                  navigate("/orders");
                }}
                className={`${primaryGradient} px-6 py-2 rounded`}
              >
                Cancel ❌
              </button>
            )}

            {order.shipping?.trackingUrl && (
              <a
                href={order.shipping.trackingUrl}
                target="_blank"
                className={`${primaryGradient} px-6 py-2 rounded`}
              >
                Track 🚚
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
