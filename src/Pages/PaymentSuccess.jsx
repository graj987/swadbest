import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "../Hooks/useAuth";
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
  const { getAuthHeader } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await API.get(
          `/api/payments/success/${orderId}`,
          { headers: getAuthHeader() }
        );

        if (!res.data?.ok) {
          throw new Error("Payment not verified");
        }

        setOrder(res.data);
      } catch (err) {
        setError("Payment not verified or failed.",err);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [orderId, getAuthHeader]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verifying payment...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-red-600 font-semibold mb-3">
            Payment Failed
          </h2>
          <button
            onClick={() => navigate("/orders")}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md w-full">

        <Lottie
          animationData={successAnimation}
          loop={false}
          className="w-40 mx-auto"
        />

        <h2 className="text-2xl font-bold text-green-600 mt-4">
          Payment Successful!
        </h2>

        <p className="text-gray-600 mt-2">
          Your order has been confirmed and is being prepared.
        </p>

        <div className="mt-6 text-sm text-gray-700 space-y-1">
          <div><b>Order ID:</b> {order.orderId}</div>
          <div><b>Payment ID:</b> {order.paymentId}</div>
          <div><b>Amount:</b> {formatCurrency(order.amount)}</div>
        </div>

        <button
          onClick={() => navigate(`/order/${order.orderId}`)}
          className="mt-6 w-full bg-orange-500 text-white py-2 rounded-lg font-semibold"
        >
          View Order
        </button>

      </div>
    </div>
  );
};

export default PaymentSuccess;
