import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "../Hooks/useAuth";

const statusBadge = (status) => {
  switch (status) {
    case "preparing":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    case "shipped":
      return "bg-blue-100 text-blue-800 border border-blue-300";
    case "delivered":
      return "bg-green-100 text-green-800 border border-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 border border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-300";
  }
};

const paymentBadge = (status) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700 border border-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    case "failed":
      return "bg-red-100 text-red-700 border border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-300";
  }
};

const Orders = () => {
  const navigate = useNavigate();
  const { getAuthHeader, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/api/orders/my", {
          headers: getAuthHeader(),
        });
        setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        }
        setError(err.response?.data?.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [getAuthHeader, logout, navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-orange-600 text-lg">Loading your orders…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
  <div className="max-w-6xl mx-auto">

    {/* PAGE HEADER */}
    <h2 className="text-3xl font-bold text-orange-600 mb-10 text-center">
      Your Orders
    </h2>

    {/* EMPTY STATE */}
    {orders.length === 0 && !error && (
      <div className="bg-white rounded-xl shadow-md p-10 text-center">
        <p className="text-gray-600 mb-6">
          Looks like you haven’t placed any orders yet.
        </p>
        <Link
          to="/products"
          className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Shop Now
        </Link>
      </div>
    )}

    {error && <p className="text-center text-red-500 mb-6">{error}</p>}

    {/* ORDER LIST */}
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
        >
          {/* ORDER HEADER */}
          <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-4">
            <div>
              <p className="font-bold text-gray-900 text-lg">
                Order ID:
                <span className="text-gray-500 ml-1 font-medium">
                  {order._id.slice(-8)}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()} •{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${paymentBadge(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus.toUpperCase()}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${statusBadge(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* PRODUCT LIST */}
          <div className="mt-4 space-y-4">
            {order.products.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 bg-orange-50/40 border border-orange-100 p-4 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <SafeImage
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-16 h-16 rounded-lg border object-cover bg-white"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.product?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ₹{item.priceAtPurchase}
                    </p>
                  </div>
                </div>

                <p className="font-bold text-gray-900">
                  ₹{item.quantity * item.priceAtPurchase}
                </p>
              </div>
            ))}
          </div>

          {/* ORDER FOOTER */}
          <div className="mt-6 pt-4 border-t flex justify-between flex-wrap gap-4 items-center">
            <p className="font-bold text-xl text-gray-900">
              Total: ₹{order.totalAmount}
            </p>

            <div className="flex gap-3">
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-semibold shadow"
                >
                  Track Order
                </a>
              )}

              <Link
                to={`/order/${order._id}`}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded-lg font-semibold shadow"
              >
                View Details
              </Link>

              {order.paymentStatus === "pending" && (
                <button
                  onClick={() => navigate(`/paynow/${order._id}`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-lg font-semibold shadow"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>

        </div>
      ))}
    </div>

  </div>
</div>

  );
};

export default Orders;
