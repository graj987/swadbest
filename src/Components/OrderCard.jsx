import React from "react";
import { Link } from "react-router-dom";

const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "packed":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white border border-orange-100 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden">

      {/* HEADER */}
      <div className="p-5 flex flex-col md:flex-row justify-between gap-3 border-b">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">
            Order:{" "}
            <span className="font-medium text-gray-600">
              #{order._id.slice(-8)}
            </span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div
          className={`px-4 py-1 text-sm font-semibold rounded-full h-fit self-start md:self-center ${getStatusColor(
            order.status
          )}`}
        >
          {order.status.toUpperCase()}
        </div>
      </div>

      {/* ITEMS */}
      <div className="p-5 space-y-4">
        {order.items.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between gap-3 bg-orange-50/40 border border-orange-100 rounded-xl p-3"
          >
            {/* IMAGE + DETAILS */}
            <div className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg border object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {item.name}
                </p>
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} × ₹{item.price}
                </p>
              </div>
            </div>

            {/* AMOUNT */}
            <p className="font-bold text-gray-900 min-w-[70px] text-right">
              ₹{item.quantity * item.price}
            </p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-5 border-t flex flex-col md:flex-row justify-between gap-3">
        <p className="font-bold text-gray-900 text-lg">
          Total: ₹{order.total}
        </p>

        <p className="text-sm text-gray-600">
          Payment:{" "}
          <span className="font-semibold text-gray-800">
            {order.paymentMethod}
          </span>
        </p>

        {/* VIEW ORDER BUTTON */}
        <Link
          to={`/order/${order._id}`}
          className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition shadow"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
