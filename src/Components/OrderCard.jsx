import React from "react";

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
    <div className="border border-orange-100 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-orange-50/30">
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
            order.status
          )}`}
        >
          {order.status}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 border-t border-gray-200 pt-3">
        {order.items.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} × ₹{item.price}
                </p>
              </div>
            </div>
            <p className="font-semibold text-gray-700">
              ₹{item.quantity * item.price}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 border-t border-gray-200 pt-3">
        <p className="font-semibold text-gray-700">Total: ₹{order.total}</p>
        <p className="text-sm text-gray-600">
          Payment Method:{" "}
          <span className="font-medium text-gray-800">
            {order.paymentMethod}
          </span>
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
