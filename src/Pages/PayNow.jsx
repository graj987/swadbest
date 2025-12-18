// src/pages/PayNow.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/hooks/useAuth";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v || 0);

const PayNow = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeader, logout } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  /* ---------- Load order ---------- */
  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      try {
        const res = await API.get(
          `/api/orders/${orderId}`,
          { headers: getAuthHeader() }
        );

        // ✅ FIX: backend returns { success, data }
        if (mounted) {
          setOrder(res.data?.data || res.data);
        }
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          logout();
          navigate("/login");
          return;
        }

        setError(
          err.response?.status === 404
            ? "Order not found."
            : "Failed to load order."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrder();
    return () => (mounted = false);
  }, [orderId, getAuthHeader, logout, navigate]);

  /* ---------- Start Razorpay ---------- */
  const startPayment = async () => {
    if (!order || paying) return;

    if (!window.Razorpay) {
      setError("Payment service unavailable.");
      return;
    }

    setPaying(true);
    setError("");

    try {
      const rzRes = await API.post(
        "/api/payments/create-order",
        { orderId: order._id },
        { headers: getAuthHeader() }
      );

      const razorOrder = rzRes.data?.razorpayOrder;
      if (!razorOrder?.id) throw new Error("Invalid Razorpay order");

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RZ_KEY_ID,
        amount: razorOrder.amount,
        currency: "INR",
        order_id: razorOrder.id,
        name: "Swadbest",
        description: `Order #${order._id}`,
        handler: async (response) => {
          try {
            const verify = await API.post(
              "/api/payments/verify",
              response,
              { headers: getAuthHeader() }
            );

            if (verify.data?.ok) {
              navigate("/orders");
            } else {
              setError("Payment verification failed.");
            }
          } catch {
            setError("Payment verification error.");
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
      console.error(err);
      setError("Unable to start payment.");
      setPaying(false);
    }
  };

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        Loading order…
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-red-600 mb-4">{error || "Order unavailable"}</p>
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

        {/* ADDRESS */}
        <div className="text-sm text-gray-700 mb-4">
          <div><b>Order ID:</b> {order._id}</div>
          <div>
            <b>Deliver to:</b>{" "}
            {address?.name}, {address?.phone}
          </div>
          <div>
            {address?.line1}, {address?.city} – {address?.pincode}
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="border rounded-xl p-4 mb-4 bg-orange-50">
          {order.products.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div key={item._id} className="flex justify-between py-2">
                <span>
                  {product.name} × {item.quantity}
                </span>
                <span>
                  {formatCurrency(item.priceAtPurchase * item.quantity)}
                </span>
              </div>
            );
          })}

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
            ? "Processing…"
            : `Pay Now • ${formatCurrency(order.totalAmount)}`}
        </button>
      </div>
    </div>
  );
};

export default PayNow;
