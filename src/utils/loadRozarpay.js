const loadRazorpay = () => {
  return new Promise((resolve) => {

    // Prevent loading during prerender
    if (
      navigator.userAgent.includes(
        "ReactSnap"
      )
    ) {
      resolve(false);
      return;
    }

    // Already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Create script
    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.setAttribute(
      "data-razorpay",
      "true"
    );

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default loadRazorpay;