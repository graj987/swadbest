// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "../Hooks/useAuth";

const Orders = () => {
  const navigate = useNavigate();
  const { getAuthHeader, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/api/orders/my", {
          headers: getAuthHeader(),
        });

        setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
          return;
        }
        setError(err.response?.data?.message || "Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [getAuthHeader, logout, navigate]);

  const paymentBadgeClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-gray-600 text-lg">Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        <h2 className="text-3xl font-bold text-orange-600 mb-8 text-center">
          My Orders
        </h2>

        {error && (
          <p className="text-center text-red-500 mb-6">{error}</p>
        )}

        {!error && orders.length === 0 && (
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              You haven’t placed any orders yet.
            </p>
            <Link
              to="/products"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              Shop Now
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border rounded-2xl p-6 bg-orange-50/40"
              >
                {/* ORDER HEADER */}
                <div className="flex justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Order #
                      <span className="text-gray-600">
                        {order._id.slice(-8)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentBadgeClass(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                {/* PRODUCTS */}
                <div className="space-y-4 border-t pt-4">
                  {order.products.map((item, idx) => {
                    const product = item.product;
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <SafeImage
                            src={product?.image}
                            alt={product?.name || "Product"}
                            className="w-16 h-16 rounded-lg border object-cover"
                          />

                          <div>
                            <p className="font-medium text-gray-800">
                              {product?.name || "Product unavailable"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × ₹{item.priceAtPurchase}
                            </p>
                          </div>
                        </div>

                        <p className="font-semibold text-gray-800">
                          ₹{item.quantity * item.priceAtPurchase}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* ORDER FOOTER */}
                <div className="flex justify-between items-center mt-6 border-t pt-4">
                  <p className="font-semibold text-lg">
                    Total: ₹{order.totalAmount}
                  </p>

                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span className="font-medium text-gray-800">
                      {order.orderStatus}
                    </span>
                  </p>
                </div>

                {/* PAY NOW */}
                {order.paymentStatus === "pending" && (
                  <button
                    onClick={() => navigate(`/paynow/${order._id}`)}
                    className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 w-full md:w-auto"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
