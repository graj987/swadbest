// src/pages/PayNow.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

const formatCurrency = (value) => {
  if (value == null) return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
};

const Loading = ({ text = "Loading..." }) => (
  <div className="py-20 text-center text-gray-600">{text}</div>
);

export default function PayNow() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // Fetch order: try single-order endpoint then fallback to user-orders
  useEffect(() => {
    let mounted = true;
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?._id) {
      navigate("/login");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Try likely single-order endpoints first
        const singleCandidates = [`/api/orders/${orderId}`, `/orders/${orderId}`];
        for (const p of singleCandidates) {
          try {
            const res = await API.get(p);
            if (!mounted) return;
            if (res?.data && res.data._id) {
              setOrder(res.data);
              return;
            }
          } catch (e) {
            console.warn("[PayNow] single path failed:", p, e?.response?.status);
          }
        }

        // Fallback: user's order list
        const userCandidates = [
          `/api/orders/user/${user._id}`,
          `/orders/user/${user._id}`,
          `/api/orders?user=${user._id}`,
        ];
        for (const p of userCandidates) {
          try {
            const res = await API.get(p);
            if (!mounted) return;
            if (Array.isArray(res?.data)) {
              const found = res.data.find((o) => o._id === orderId);
              if (found) {
                setOrder(found);
                return;
              } else {
                setError("Order not found for this account.");
                return;
              }
            }
          } catch (e) {
            console.warn("[PayNow] user-list path failed:", p, e?.response?.status);
          }
        }

        setError("Could not fetch order. Check console for details.");
      } catch (err) {
        console.error("[PayNow] load error:", err);
        setError("Failed to load order. See console.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [navigate, orderId]);

  // Start payment flow
  const startPayment = useCallback(async () => {
    if (!order) {
      setError("Order not available.");
      return;
    }

    if (!import.meta.env.VITE_RZ_KEY_ID) {
      setError("Payment key not configured (VITE_RZ_KEY_ID).");
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      setError("Razorpay SDK not loaded. Add the script to index.html.");
      return;
    }

    setPaying(true);
    setError("");

    const candidatePaths = [
      "/api/payments/create-order",
      "/payments/create-order",
      "/api/payments/createOrder",
      "/payments/createOrder",
    ];

    try {
      // Try create-order on backend
      let createRes = null;
      for (const p of candidatePaths) {
        try {
          console.log("[PayNow] attempting create-order:", p);
          createRes = await API.post(p, { orderId: order._id });
          console.log("[PayNow] create-order response:", p, createRes.status);
          if (createRes?.data) break;
        } catch (e) {
          console.warn("[PayNow] create-order failed:", p, e?.response?.status);
          // if server error, break and surface error
          if (e?.response?.status >= 500) throw e;
        }
      }

      if (!createRes?.data) {
        setError("Payment init failed: server did not return an order. See console.");
        return;
      }

      const razorpayOrder = createRes.data.razorpayOrder || createRes.data.order || createRes.data;
      if (!razorpayOrder || !razorpayOrder.id) {
        console.error("[PayNow] invalid create-order payload:", createRes.data);
        setError("Invalid payment init response. See console.");
        return;
      }

      // Defensive checks for amount (Razorpay expects amount in paise)
      if (!razorpayOrder.amount || Number(razorpayOrder.amount) <= 0) {
        console.error("[PayNow] invalid amount:", razorpayOrder);
        setError("Payment amount invalid.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RZ_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "Swad Order Payment",
        description: `Order #${order._id}`,
        order_id: razorpayOrder.id,
        prefill: { name: JSON.parse(localStorage.getItem("user"))?.name || "" },
        theme: { color: "#fb923c" },
        handler: async function (response) {
          // Frontend verifies with backend
          try {
            const verifyCandidates = ["/api/payments/verify", "/payments/verify"];
            let verified = false;
            for (const vp of verifyCandidates) {
              try {
                const vr = await API.post(vp, response);
                console.log("[PayNow] verify response:", vp, vr.data);
                verified = vr?.data?.ok || vr?.data?.status === "ok";
                if (verified) break;
              } catch (vErr) {
                console.warn("[PayNow] verify failed:", vp, vErr?.response?.status);
              }
            }
            if (verified) {
              navigate("/orders");
            } else {
              setError("Payment verification failed. See console.");
            }
          } catch (err) {
            console.error("[PayNow] verify handler error:", err);
            setError("Payment verification encountered an error.");
          } finally {
            setPaying(false);
          }
        },
      };

      // Open Razorpay checkout with verbose logging handlers
      try {
        console.log("[PayNow] opening Razorpay checkout", { options });
        const rzp = new window.Razorpay(options);

        rzp.on && rzp.on("payment.failed", (resp) => {
          console.error("[Razorpay] payment.failed:", resp);
          setError("Payment failed or was cancelled.");
          setPaying(false);
        });

        // Try-catch around open to catch sync issues (popup blockers etc)
        try {
          rzp.open();
        } catch (openErr) {
          console.error("[PayNow] rzp.open() error:", openErr);
          setError("Could not open payment window. Try disabling popup blockers or extensions.");
          setPaying(false);
        }
      } catch (err) {
        console.error("[PayNow] Razorpay init error:", err);
        setError("Payment UI initialization failed.");
        setPaying(false);
      }
    } catch (err) {
      console.error("[PayNow] startPayment error:", err);
      setError("Could not start payment. See console for details.");
      setPaying(false);
    }
  }, [order, navigate]);

  // UX: simple header + order summary
  if (loading) return <Loading text="Loading order..." />;
  if (error) return (
    <div className="py-20 px-4 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <h3 className="text-lg font-semibold text-red-600 mb-3">Error</h3>
        <p className="text-sm text-gray-700">{error}</p>
        <button
          onClick={() => { setError(""); setLoading(true); /* trigger reload */ setTimeout(() => window.location.reload(), 200); }}
          className="mt-4 inline-block px-4 py-2 bg-orange-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );
  if (!order) return <Loading text="Order not available." />;

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-orange-100">
          <h2 className="text-xl font-bold text-orange-600 mb-4">Complete Payment</h2>

          <div className="mb-4 text-sm text-gray-700">
            <div><strong>Order ID:</strong> <span className="text-gray-900">{order._id}</span></div>
            <div><strong>Placed:</strong> <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</span></div>
            <div><strong>Address:</strong> <span>{order.address || "-"}</span></div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 mb-4">
            {(order.products || []).map((item) => (
              <div key={item.product?._id || Math.random()} className="flex justify-between py-2">
                <div className="text-sm text-gray-800">{item.product?.name || "Product"} × {item.quantity}</div>
                <div className="text-sm font-medium">{formatCurrency((item.product?.price || 0) * item.quantity)}</div>
              </div>
            ))}

            <div className="border-t pt-3 mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</div>
            </div>
          </div>

          <button
            onClick={startPayment}
            disabled={paying}
            className="mt-2 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
          >
            {paying ? "Processing..." : `Pay Now • ${formatCurrency(order.totalAmount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
