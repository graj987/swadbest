import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "../Hooks/useAuth";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v || 0);

const PayNow = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  /* ---------- LOAD ORDER ---------- */

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/orders/${orderId}`);
      setOrder(res.data?.data || null);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      setError(
        err.response?.status === 404
          ? "Order not found."
          : "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, logout, navigate]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  /* ---------- START PAYMENT ---------- */

  const startPayment = async () => {
    if (!order?._id || paying) return;

    if (order.paymentStatus === "paid") {
      navigate(`/order/${order._id}`);
      return;
    }

    if (!window.Razorpay) {
      setError("Payment service unavailable. Please refresh.");
      return;
    }

    try {
      setPaying(true);
      setError("");

      const rzRes = await API.post("/api/payments/create-order", {
        orderId: order._id,
      });

      if (!rzRes.data?.ok || !rzRes.data?.razorpayOrder?.id) {
        throw new Error("Failed to create Razorpay order");
      }

      const razorOrder = rzRes.data.razorpayOrder;

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RZ_KEY_ID,
        amount: razorOrder.amount,
        currency: "INR",
        order_id: razorOrder.id,
        name: "Swadbest",
        description: `Order #${order._id}`,
        handler: async (response) => {
          try {
            const verify = await API.post("/api/payments/verify", response);

            if (verify.data?.ok) {
              navigate(`/payment-success/${order._id}`);
            } else {
              navigate(`/order/${order._id}`);
            }
          } catch {
            navigate(`/order/${order._id}`);
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled. You can retry.");
            setPaying(false);
          },
        },
        theme: { color: "#fb923c" },
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err.message);
      setError("Unable to start payment. Please try again.");
      setPaying(false);
    }
  };

  /* ---------- UI ---------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-red-600 mb-4">
            {error || "Order unavailable"}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const { address } = order;

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-xl font-bold text-orange-600 mb-4">
          Complete Payment
        </h2>

        <div className="text-sm text-gray-700 mb-4 space-y-1">
          <div>
            <b>Order ID:</b> {order._id}
          </div>
          <div>
            <b>Deliver to:</b> {address?.name}, {address?.phone}
          </div>
          <div>
            {address?.line1}, {address?.city}, {address?.state} –{" "}
            {address?.pincode}
          </div>
        </div>

        <div className="border rounded-xl p-4 mb-6 bg-orange-50">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2">
              <span>
                {item.product?.name || "Product"} × {item.quantity}
              </span>
              <span>
                {formatCurrency(item.priceAtPurchase * item.quantity)}
              </span>
            </div>
          ))}

          <div className="border-t pt-3 mt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <button
          onClick={startPayment}
          disabled={paying}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
        >
          {paying
            ? "Processing..."
            : `Pay Now • ${formatCurrency(order.totalAmount)}`}
        </button>
      </div>
    </div>
  );
};

export default PayNow;