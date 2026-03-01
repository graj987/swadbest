import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api";
import Lottie from "lottie-react";
import successAnimation from "@/assets/success.json";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v || 0);

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Payment Successful | Swadbest";

    const loadOrder = async () => {
      try {
        const res = await API.get(`/api/orders/${orderId}`);
        const data = res.data?.data;

        if (!data || data.paymentStatus !== "paid") {
          throw new Error("Payment not confirmed");
        }

        setOrder(data);
      } catch (err) {
        console.error(err);
        setError("Payment verification failed.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Confirming your payment…</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-orange-50">
        <section className="bg-white p-6 rounded-xl shadow text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-3">
            Payment Verification Failed
          </h1>
          <button
            onClick={() => navigate("/orders")}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Go to Orders
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <section className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md w-full">
        <Lottie
          animationData={successAnimation}
          loop={false}
          className="w-40 mx-auto"
        />

        <h1 className="text-2xl font-bold text-green-600 mt-4">
          Payment Successful
        </h1>

        <p className="text-gray-600 mt-2">
          Your order has been confirmed and is now being processed.
        </p>

        <div className="mt-6 text-sm text-gray-700 space-y-1">
          <div>
            <strong>Order ID:</strong> {order._id}
          </div>
          <div>
            <strong>Payment ID:</strong> {order.razorpay_payment_id}
          </div>
          <div>
            <strong>Total Paid:</strong>{" "}
            {formatCurrency(order.totalAmount)}
          </div>
        </div>

        <button
          onClick={() => navigate(`/order/${order._id}`)}
          className="mt-6 w-full bg-orange-500 text-white py-2 rounded-lg font-semibold"
        >
          View Order Details
        </button>
      </section>
    </main>
  );
};

export default PaymentSuccess;