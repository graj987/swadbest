// src/pages/checkout/PaymentHandler.jsx

import API from "@/api";

/* ================= INTERNAL STATE ================= */

let razorpayInstance = null;
let paymentLock = false;

/* ================= LOAD SDK SAFELY ================= */

const loadRazorpaySDK = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay SDK"));

    document.body.appendChild(script);
  });

/* ================= MAIN PAYMENT ================= */

export const startRazorpayPayment = async ({ orderId, user }) => {
  if (!orderId) throw new Error("Order ID missing");

  if (paymentLock)
    throw new Error("Payment already in progress");

  paymentLock = true;

  const cleanup = () => {
    try {
      razorpayInstance?.close?.();
    } catch (err) {
        console.error("err",err)
    }

    razorpayInstance = null;
    paymentLock = false;
  };

  try {
    /* ---------- Ensure SDK ---------- */
    await loadRazorpaySDK();

    /* ---------- Create Razorpay Order ---------- */
    const { data } = await API.post(
      "/api/payments/create-order",
      { orderId }
    );

    if (!data?.ok || !data?.razorpayOrder) {
      throw new Error(
        data?.message || "Unable to initiate payment"
      );
    }

    const razorOrder = data.razorpayOrder;

    /* ---------- Razorpay Checkout ---------- */

    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Payment session timed out"));
      }, 5 * 60 * 1000); // 5 minutes

      const finish = (fn) => (value) => {
        clearTimeout(timeout);
        cleanup();
        fn(value);
      };

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RZ_KEY_ID,
        amount: razorOrder.amount,
        currency: razorOrder.currency || "INR",
        name: "Swadbest",
        description: "Secure Payment",
        order_id: razorOrder.id,

        prefill: {
          name: user?.name || "",
          contact: user?.phone || "",
        },

        notes: {
          internalOrderId: orderId,
        },

        theme: { color: "#f97316" },

        handler: async (response) => {
          try {
            const verify = await API.post(
              "/api/payments/verify",
              {
                orderId,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_signature:
                  response.razorpay_signature,
              }
            );

            if (!verify.data?.ok)
              throw new Error(
                verify.data?.message ||
                  "Payment verification failed"
              );

            finish(resolve)(verify.data.orderId);
          } catch (err) {
            finish(reject)(
              new Error(
                err?.response?.data?.message ||
                  err.message ||
                  "Verification failed"
              )
            );
          }
        },

        modal: {
          escape: false,
          ondismiss: () =>
            finish(reject)(
              new Error("Payment cancelled")
            ),
        },
      });

      rzp.on("payment.failed", (resp) => {
        const msg =
          resp?.error?.description ||
          resp?.error?.reason ||
          "Payment failed";

        finish(reject)(new Error(msg));
      });

      razorpayInstance = rzp;
      rzp.open();
    });
  } catch (err) {
    cleanup();
    throw err;
  }
};