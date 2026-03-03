// src/pages/checkout/CheckoutForm.jsx

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import { toast } from "sonner";

const CheckoutForm = ({ onPlaceOrder, loading }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ================= STATE ================= */

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [cartReady, setCartReady] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  const previewAbortRef = useRef(null);

  const [paymentMethod, setPaymentMethod] = useState("");

  const [pricing, setPricing] = useState({
    subtotal: 0,
    tax: 0,
    deliveryCharge: 0,
    codCharge: 0,
    totalAmount: 0,
  });

  /* ================= CART CHECK ================= */

  useEffect(() => {
    let mounted = true;

    const checkCart = async () => {
      try {
        const res = await API.get("/api/cart");

        if (!mounted) return;

        if (!res.data?.items?.length) {
          toast.error("Your cart is empty");
          navigate("/cart");
          return;
        }

        setCartReady(true);
      } catch {
        toast.error("Failed to load cart");
      }
    };

    checkCart();

    return () => {
      mounted = false;
    };
  }, [navigate, user]);

  /* ================= FETCH ADDRESSES ================= */

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await API.get("/api/address/getadd");

      if (!res.data?.success) return;

      const list = res.data.data || [];
      setSavedAddresses(list);

      if (list.length) {
        setSelectedAddress(list[0]._id);
      }
    } catch {
      toast.error("Failed to load addresses");
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  /* ================= PRICE PREVIEW ================= */

  useEffect(() => {
    if (!cartReady || !selectedAddress || !paymentMethod) return;

    const controller = new AbortController();
    previewAbortRef.current?.abort?.();
    previewAbortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        setPreviewLoading(true);
        setPreviewReady(false);

        const res = await API.post(
          "/api/orders/price-preview",
          {
            addressId: selectedAddress,
            paymentMethod,
          },
          { signal: controller.signal }
        );

        if (!res.data?.success)
          throw new Error(res.data?.message);

        setPricing(res.data.data);
        setPreviewReady(true);
      } catch (err) {
        if (err.name === "CanceledError") return;

        toast.error(
          err?.response?.data?.message ||
            "Failed to calculate order price"
        );
      } finally {
        setPreviewLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedAddress, paymentMethod, cartReady]);

  /* ================= SUBMIT ================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading || previewLoading)
      return toast.error("Please wait...");

    if (!previewReady || pricing.totalAmount <= 0)
      return toast.error("Pricing not ready");

    onPlaceOrder({
      addressId: selectedAddress,
      paymentMethod,
    });
  };

  /* ================= DERIVED STATE ================= */

  const checkoutReady = useMemo(
    () =>
      cartReady &&
      selectedAddress &&
      paymentMethod &&
      previewReady,
    [cartReady, selectedAddress, paymentMethod, previewReady]
  );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          Secure Checkout
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">

          {/* LEFT */}
          <div>
            <h3 className="font-semibold mb-3">Delivery Address</h3>

            {!savedAddresses.length && (
              <p className="text-sm text-gray-500">
                No address found. Please add one from profile.
              </p>
            )}

            {savedAddresses.map((a) => (
              <div
                key={a._id}
                onClick={() => setSelectedAddress(a._id)}
                className={`p-3 border rounded mb-2 cursor-pointer ${
                  selectedAddress === a._id
                    ? "border-orange-500 bg-orange-100"
                    : ""
                }`}
              >
                {a.name} — {a.city} ({a.pincode})
              </div>
            ))}

            <h3 className="font-semibold mt-6">
              Payment Method
            </h3>

            {["Online", "COD"].map((m) => (
              <label key={m} className="block mt-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m}
                  checked={paymentMethod === m}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />
                <span className="ml-2">{m}</span>
              </label>
            ))}
          </div>

          {/* RIGHT */}
          <div className="bg-orange-50 p-5 rounded">
            <h3 className="font-semibold mb-4">
              Order Summary
            </h3>

            <Row label="Subtotal" value={pricing.subtotal} />
            <Row label="GST" value={pricing.tax} />
            <Row label="Delivery" value={pricing.deliveryCharge} />

            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span>₹{pricing.totalAmount}</span>
            </div>

            {!checkoutReady && (
              <p className="text-xs text-gray-500 mt-3">
                Select address and payment method to continue
              </p>
            )}

            <button
              type="submit"
              disabled={!checkoutReady || loading || previewLoading}
              className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {previewLoading
                ? "Calculating..."
                : loading
                ? "Processing..."
                : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span>{label}</span>
    <span>₹{value || 0}</span>
  </div>
);

export default CheckoutForm;