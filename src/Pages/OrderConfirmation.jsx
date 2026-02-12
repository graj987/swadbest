// src/pages/OrderConfirmation.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import { toast } from "sonner";

/* ---------- helper to format shipping ---------- */
const shippingMessage = (shipping) => {
  if (!shipping?.shipmentId) return "Your order has been received and is being prepared.";

  if (shipping.shipmentId && !shipping.awb)
    return "Your order is packed and awaiting courier pickup.";

  if (shipping.awb && shipping.status === "shipped")
    return "Your package has been picked up by the courier.";

  if (shipping.status === "in_transit")
    return "Your package is on the way.";

  if (shipping.status === "out_for_delivery")
    return "Out for delivery. Get ready!";

  if (shipping.status === "delivered")
    return "Delivered successfully.";

  return "Processing shipment.";
};

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { getAuthHeader } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/api/orders/${orderId}`, {
          headers: getAuthHeader(),
        });
        setOrder(res.data.data);
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, getAuthHeader]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading order…
      </div>
    );
  }

  if (!order) return null;

  const shipping = order.shipping || {};

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        {/* SUCCESS */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">✅</div>
          <h1 className="text-2xl font-bold text-green-600">
            Order Confirmed
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Order ID: <span className="font-semibold">{order._id}</span>
          </p>

          {/* NEW: SHIPPING MESSAGE */}
          <p className="mt-3 text-sm text-gray-700">
            {shippingMessage(shipping)}
          </p>
        </div>

        {/* SHOW AWB IF EXISTS */}
        {shipping.awb && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm mb-5">
            <p>
              Tracking Number: <b>{shipping.awb}</b>
            </p>
            <a
              href={`https://shiprocket.co/tracking/${shipping.awb}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Track Shipment
            </a>
          </div>
        )}

        {/* ITEMS */}
        <div className="space-y-3">
          {order.products.map((item) => (
            <div key={item._id} className="flex justify-between border rounded-lg p-3">
              <div>
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-xs text-gray-500">
                  {item.variant.weight} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                ₹{item.variant.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* ADDRESS */}
        <div className="mt-6 border-t pt-4 text-sm">
          <h3 className="font-semibold mb-1">Delivery Address</h3>
          <p>{order.address.name}</p>
          <p>{order.address.house}, {order.address.street}</p>
          <p>{order.address.city} - {order.address.pincode}</p>
          <p>{order.address.state}</p>
        </div>

        {/* PAYMENT */}
        <div className="mt-4 text-sm">
          <p>Payment Method: <b>{order.paymentMethod}</b></p>
          <p>
            Payment Status:{" "}
            <span className="font-semibold text-green-600">
              {order.paymentStatus}
            </span>
          </p>
        </div>

        {/* TOTAL */}
        <div className="mt-4 text-lg font-bold flex justify-between">
          <span>Total Paid</span>
          <span>₹{order.totalAmount}</span>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={async () => {
              const res = await API.get(`/api/orders/${order._id}/invoice`, {
                headers: getAuthHeader(),
                responseType: "blob",
              });

              const url = URL.createObjectURL(
                new Blob([res.data], { type: "application/pdf" })
              );
              window.open(url, "_blank");
            }}
            className="flex-1 bg-gray-200 py-3 rounded-lg font-semibold"
          >
            Download Invoice
          </button>

          <Link
            to="/orders"
            className="flex-1 text-center bg-orange-600 text-white py-3 rounded-lg font-semibold"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
