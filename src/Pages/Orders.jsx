import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "https://swadbackendserver.onrender.com/api/orders/user",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load your orders. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-orange-100">
        <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">
          My Orders
        </h2>

        {loading && <p className="text-center text-gray-600">Loading orders...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && orders.length === 0 && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">You haven’t placed any orders yet.</p>
            <Link
              to="/products"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600"
            >
              Shop Now
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-orange-100 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-orange-50/30"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Order ID: <span className="text-gray-600">{order._id}</span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div
                    className={`mt-2 md:mt-0 text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 border-t border-gray-200 pt-3">
                  {order.products.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × ₹{item.product.price}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-700">
                        ₹{item.quantity * item.product.price}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 border-t border-gray-200 pt-3">
                  <p className="font-semibold text-gray-700">
                    Total: ₹{order.totalAmount}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span className="font-medium text-gray-800">
                      {order.orderStatus}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
