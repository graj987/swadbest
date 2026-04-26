// src/pages/Checkout.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  ChevronRight,
  CreditCard,
  Smartphone,
  Banknote,
  Lock,
  Truck,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  Package,
  ArrowLeft,
  Loader2,
  ArrowRight,
  Info,
  Gift,
  Sparkles,
  TrendingUp,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const FREE_DELIVERY_THRESHOLD = 449;
const DELIVERY_CHARGE = 60;
const COD_CHARGE = 20;
const GST_RATE = 0.05;

/* ─────────────────────────────────────────────
   PRICING ENGINE (client-side optimistic)
───────────────────────────────────────────── */
function calcPricing(subtotal, paymentMethod, isFirstOrder = false) {
  let deliveryCharge, freeDelivery, deliveryNote;
  if (isFirstOrder) {
    deliveryCharge = 0;
    freeDelivery = true;
    deliveryNote = "first_order";
  } else if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    deliveryCharge = 0;
    freeDelivery = true;
    deliveryNote = "threshold_met";
  } else {
    deliveryCharge = DELIVERY_CHARGE;
    freeDelivery = false;
    deliveryNote = "charged";
  }
  const amountForFreeDelivery =
    !isFirstOrder && !freeDelivery
      ? Math.ceil(FREE_DELIVERY_THRESHOLD - subtotal)
      : null;
  const codCharge = paymentMethod === "COD" ? COD_CHARGE : 0;
  const gstAmount = Math.round((subtotal * GST_RATE) / (1 + GST_RATE));
  const baseAmount = subtotal - gstAmount;
  const totalAmount = subtotal + deliveryCharge + codCharge;
  const deliverySaved = freeDelivery ? DELIVERY_CHARGE : 0;
  let nudge = null;
  if (isFirstOrder) {
    nudge = {
      type: "first_order",
      text: `🎁 Free delivery on your first order — you save ₹${DELIVERY_CHARGE}!`,
    };
  } else if (amountForFreeDelivery) {
    nudge = {
      type: "upsell",
      text: `Upgrade to ₹449 pack and get FREE delivery! Save ₹${DELIVERY_CHARGE}`,
    };
  }
  return {
    subtotal,
    baseAmount,
    gstAmount,
    deliveryCharge,
    deliveryNote,
    codCharge,
    totalAmount,
    freeDelivery,
    isFirstOrder,
    deliverySaved,
    amountForFreeDelivery,
    nudge,
  };
}

const EMPTY_PRICING = {
  subtotal: 0,
  baseAmount: 0,
  gstAmount: 0,
  deliveryCharge: 0,
  deliveryNote: "charged",
  codCharge: 0,
  totalAmount: 0,
  freeDelivery: false,
  isFirstOrder: false,
  deliverySaved: 0,
  amountForFreeDelivery: null,
  nudge: null,
};

/* ─────────────────────────────────────────────
   fmt helper
───────────────────────────────────────────── */
const fmt = (v) => `₹${(v || 0).toLocaleString("en-IN")}`;

/* ─────────────────────────────────────────────
   FIELD
   - fontSize 16px: prevents Android Chrome auto-zoom on focus
   - w-full + min-w-0: prevents overflow in grid cells
───────────────────────────────────────────── */
function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 min-w-0 w-full">
      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400 truncate">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={
          name === "name"
            ? "name"
            : name === "phone"
              ? "tel"
              : name === "pincode"
                ? "postal-code"
                : name === "city"
                  ? "address-level2"
                  : name === "state"
                    ? "address-level1"
                    : "off"
        }
        style={{ fontSize: "16px" }}
        className={`
          h-12 px-3.5 rounded-xl border text-stone-800 bg-white outline-none
          transition-all duration-150 placeholder:text-stone-300
          w-full min-w-0 block
          ${
            focused
              ? "border-orange-400 ring-2 ring-orange-400/15 shadow-sm"
              : "border-stone-200 hover:border-stone-300"
          }
        `}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAYMENT OPTION
   - min-h-[56px]: 44px+ touch target
   - overflow-hidden on label: prevents content escape
   - flex-wrap on text row: badge wraps gracefully on narrow screens
───────────────────────────────────────────── */
function PaymentOption({
  value,
  selected,
  onChange,
  icon,
  label,
  sublabel,
  badge,
}) {
  const Icon = icon;
  return (
    <label
      className={`
        flex items-center gap-3 px-4 rounded-xl border-2 cursor-pointer
        transition-all duration-150 min-h-14 overflow-hidden w-full
        ${
          selected
            ? "border-orange-500 bg-orange-50 shadow-sm shadow-orange-500/10"
            : "border-stone-200 bg-white hover:border-stone-300"
        }
      `}
      style={{ paddingTop: "14px", paddingBottom: "14px" }}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={selected}
        onChange={onChange}
        className="sr-only"
      />
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-orange-100" : "bg-stone-100"}`}
      >
        <Icon
          className={`w-5 h-5 ${selected ? "text-orange-600" : "text-stone-500"}`}
          strokeWidth={2}
        />
      </div>
      {/* Text — min-w-0 is critical to prevent flex child overflow */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p
            className={`text-sm font-bold leading-snug ${selected ? "text-orange-700" : "text-stone-700"}`}
          >
            {label}
          </p>
          {badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
        {sublabel && (
          <p className="text-[11px] text-stone-400 mt-0.5 leading-snug wrap-break-word">
            {sublabel}
          </p>
        )}
      </div>
      {/* Radio indicator */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-1 ${selected ? "border-orange-500" : "border-stone-300"}`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
      </div>
    </label>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
function SectionHeader({ icon, title, action }) {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between mb-4 gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-orange-600" strokeWidth={2} />
        </div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.12em] text-stone-500 truncate">
          {title}
        </h3>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DELIVERY ROW
───────────────────────────────────────────── */
function DeliveryRow({ pricing }) {
  const { deliveryNote } = pricing;
  if (deliveryNote === "first_order") {
    return (
      <div className="flex justify-between items-center gap-2 text-sm">
        <span className="text-stone-600 flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="shrink-0">Delivery</span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 whitespace-nowrap">
            <Sparkles className="w-2.5 h-2.5 shrink-0" /> FIRST ORDER
          </span>
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="text-stone-300 line-through text-xs">
            ₹{DELIVERY_CHARGE}
          </span>
          <span className="text-emerald-600 font-bold">FREE</span>
        </span>
      </div>
    );
  }
  if (deliveryNote === "threshold_met") {
    return (
      <div className="flex justify-between items-center text-sm">
        <span className="text-stone-600">Delivery</span>
        <span className="text-emerald-600 font-bold">FREE</span>
      </div>
    );
  }
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-stone-600">Delivery</span>
        <span className="text-stone-700 font-semibold">₹{DELIVERY_CHARGE}</span>
      </div>
      <p className="text-[11px] text-stone-400 text-right">
        Free on ₹{FREE_DELIVERY_THRESHOLD}+ orders
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NUDGE BANNER
───────────────────────────────────────────── */
function NudgeBanner({ nudge }) {
  if (!nudge) return null;
  if (nudge.type === "first_order") {
    return (
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 shadow-sm w-full overflow-hidden">
        <Gift className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-orange-800 leading-snug wrap-break-words min-w-0">
          {nudge.text}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 shadow-sm w-full overflow-hidden">
      <TrendingUp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-xs font-bold text-amber-800 leading-snug wrap-break-words min-w-0">
        {nudge.text}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MOBILE STEP GUARD
───────────────────────────────────────────── */
function MobileStepGuard({ selectedAddress, paymentMethod }) {
  if (selectedAddress && paymentMethod) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 mb-2 overflow-hidden">
      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium flex-wrap min-w-0">
        {!selectedAddress && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <MapPin className="w-3 h-3 text-orange-400 shrink-0" /> Select
            address
          </span>
        )}
        {!selectedAddress && !paymentMethod && (
          <span className="text-stone-300">·</span>
        )}
        {!paymentMethod && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <CreditCard className="w-3 h-3 text-orange-400 shrink-0" /> Select
            payment
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CART ITEM ROW (shared, used in both panels)
   - overflow-hidden on container
   - truncate on product name
   - shrink-0 on price to never compress
───────────────────────────────────────────── */
function CartItemRow({ item }) {
  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      {/* Thumbnail */}
      <div
        className="w-10 h-10 rounded-xl border border-stone-100 bg-stone-50
                      flex items-center justify-center shrink-0 overflow-hidden"
      >
        {item.product?.image ? (
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <Package className="w-4 h-4 text-stone-300" />
        )}
      </div>
      {/* Info — min-w-0 prevents overflow */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-stone-700 truncate leading-snug">
          {item.product?.name}
        </p>
        <p className="text-[11px] text-stone-400 truncate">
          {item.variant?.weight && `${item.variant.weight} · `}Qty{" "}
          {item.quantity}
        </p>
      </div>
      {/* Price — never shrinks */}
      <p className="text-xs font-bold text-stone-800 shrink-0 pl-1">
        {fmt((item.variant?.price || 0) * item.quantity)}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRICING BREAKDOWN
───────────────────────────────────────────── */
function PricingBreakdown({ pricing, pricingLoading, paymentMethod }) {
  if (pricingLoading) {
    return (
      <div className="flex items-center justify-center py-4 gap-2 text-stone-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Calculating charges…</span>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between text-sm text-stone-600 gap-2">
        <span className="min-w-0 truncate">Item total (MRP)</span>
        <span className="shrink-0">{fmt(pricing.subtotal)}</span>
      </div>
      <div className="flex justify-between text-xs text-stone-400 pl-3 border-l-2 border-stone-100 gap-2">
        <span className="flex items-center gap-1 min-w-0 truncate">
          Incl. GST (5%)
          <span title="Prices are MRP inclusive. GST is already included.">
            <Info className="w-3 h-3 text-stone-300 cursor-help shrink-0" />
          </span>
        </span>
        <span className="shrink-0">{fmt(pricing.gstAmount)}</span>
      </div>
      <DeliveryRow pricing={pricing} />
      {pricing.codCharge > 0 && (
        <div className="flex justify-between text-sm text-stone-600 gap-2">
          <span className="min-w-0 truncate">COD handling fee</span>
          <span className="shrink-0">{fmt(pricing.codCharge)}</span>
        </div>
      )}
      {pricing.isFirstOrder && pricing.deliverySaved > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 gap-2 overflow-hidden">
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 min-w-0">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">You saved</span>
          </span>
          <span className="text-xs font-black text-emerald-700 shrink-0">
            ₹{pricing.deliverySaved}
          </span>
        </div>
      )}
      <div className="mt-4 pt-3 border-t-2 border-stone-100 flex justify-between font-black text-stone-900 text-base gap-2">
        <span>Total Payable</span>
        <span className="shrink-0">{fmt(pricing.totalAmount)}</span>
      </div>
      <p className="text-[10px] text-stone-400 text-center">
        All prices are MRP inclusive of taxes
      </p>
      {!paymentMethod && (
        <p className="text-[11px] text-stone-400 text-center pt-1">
          Select a payment method to see final charges
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const FORM_ID = "checkout-form";

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricing, setPricing] = useState(EMPTY_PRICING);
  const [isFirstOrder, setIsFirstOrder] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  /* Android soft-keyboard detection */
  useEffect(() => {
    if (!window.visualViewport) return;
    const onResize = () => {
      setKeyboardOpen(window.innerHeight - window.visualViewport.height > 150);
    };
    window.visualViewport.addEventListener("resize", onResize);
    return () => window.visualViewport.removeEventListener("resize", onResize);
  }, []);

  const abortRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    house: "",
    street: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    paymentMethod: "",
  });

  const cartSubtotal = cart.reduce(
    (sum, i) => sum + (i.variant?.price || 0) * i.quantity,
    0,
  );
  const canSubmit = selectedAddress && form.paymentMethod && !loading;

  /* ── Load cart ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/api/cart");
        const items = res.data?.items || [];
        if (!items.length) {
          navigate("/cart");
          return;
        }
        setCart(items);
      } catch {
        toast.error("Failed to load cart");
      }
    };
    load();
    setForm((f) => ({
      ...f,
      name: user?.name || "",
      phone: user?.phone || "",
    }));
  }, [navigate, user]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ── Fetch saved addresses ── */
  const fetchSaved = useCallback(async () => {
    try {
      const res = await API.get("/api/address/getadd");
      if (res.data.success) {
        setSavedAddresses(res.data.data);
        if (res.data.data.length) {
          setSelectedAddress(res.data.data[0]._id);
          setShowForm(false);
        } else setShowForm(true);
      }
    } catch {
      toast.error("Failed to load saved addresses");
    }
  }, []);
  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  /* ── Optimistic pricing ── */
  useEffect(() => {
    if (!form.paymentMethod || !cartSubtotal) return;
    setPricing(
      calcPricing(cartSubtotal, form.paymentMethod, isFirstOrder === true),
    );
  }, [form.paymentMethod, cartSubtotal, isFirstOrder]);

  /* ── Server price preview — debounced 400ms ── */
  useEffect(() => {
    if (!selectedAddress || !form.paymentMethod || !cart.length) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(async () => {
      try {
        setPricingLoading(true);
        const res = await API.post(
          "/api/orders/price-preview",
          { addressId: selectedAddress, paymentMethod: form.paymentMethod },
          { signal: controller.signal },
        );
        if (res.data?.success && res.data?.data) {
          setPricing(res.data.data);
          setIsFirstOrder(res.data.data.isFirstOrder);
        }
      } catch (err) {
        if (err.name === "CanceledError") return;
      } finally {
        setPricingLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cart.length, selectedAddress, form.paymentMethod]);

  /* ── Build products payload ── */
  const buildProductsPayload = useCallback(() => {
    if (!cart.length) throw new Error("Cart empty");
    return cart.map((item) => {
      if (!item.product?._id) throw new Error("Invalid product");
      const variantIndex =
        item.variantIndex ??
        item.product.variants?.findIndex(
          (v) => v.weight === item.variant?.weight,
        );
      if (variantIndex < 0) throw new Error("Variant not found");
      if (!item.quantity || item.quantity <= 0)
        throw new Error("Invalid quantity");
      return {
        product: item.product._id,
        variantIndex,
        quantity: item.quantity,
      };
    });
  }, [cart]);

  /* ── Detect location ── */
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported");
      return;
    }
    setDetectingLoc(true);
    toast.info("Detecting your location…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          const addr = data.address || {};
          setForm((f) => ({
            ...f,
            city: addr.city || addr.town || "",
            state: addr.state || "",
            pincode: addr.postcode || "",
          }));
          toast.success("Location detected — please verify the details.");
        } catch {
          toast.error("Unable to fetch address details");
        } finally {
          setDetectingLoc(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setDetectingLoc(false);
      },
    );
  };

  /* ── Save address ── */
  const saveAddress = async () => {
    const required = [
      "name",
      "phone",
      "house",
      "street",
      "pincode",
      "city",
      "state",
    ];
    for (const r of required) {
      if (!form[r]) return toast.error(`Please fill in: ${r}`);
    }
    if (!/^\d{6}$/.test(form.pincode))
      return toast.error("Please enter a valid 6-digit pincode");
    try {
      setLoading(true);
      const res = await API.post("/api/address/add", form);
      if (!res.data.success) return toast.error(res.data.message);
      toast.success("Address saved!");
      await fetchSaved();
    } catch {
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  /* ── Place order ── */
  const handlePlaceOrder = async (e) => {
    e?.preventDefault();
    if (loading) return;
    if (!selectedAddress)
      return toast.error("Please select a delivery address");
    if (!form.paymentMethod)
      return toast.error("Please select a payment method");
    try {
      setLoading(true);
      const products = buildProductsPayload();

      if (form.paymentMethod === "COD") {
        const res = await API.post("/api/orders/postorders", {
          products,
          addressId: selectedAddress,
          paymentMethod: "COD",
        });
        if (!res.data?.success)
          throw new Error(res.data?.message || "Order failed");
        toast.success("🎉 Order placed successfully!");
        localStorage.removeItem("cart");
        navigate("/orders");
        return;
      }

      const orderRes = await API.post("/api/orders/postorders", {
        products,
        addressId: selectedAddress,
        paymentMethod: "Online",
      });
      if (!orderRes.data?.success) throw new Error("Order creation failed");
      const orderId =
        orderRes.data?.data?._id ||
        orderRes.data?.order?._id ||
        orderRes.data?.orderId;
      if (!orderId) throw new Error("Order ID not returned from server");

      const paymentRes = await API.post("/api/payments/create-order", {
        orderId,
      });
      if (!paymentRes.data?.ok || !paymentRes.data?.razorpayOrder)
        throw new Error("Failed to initiate payment");

      const razorOrder = paymentRes.data.razorpayOrder;
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RZ_KEY_ID,
        amount: razorOrder.amount,
        currency: "INR",
        name: "SwadBest",
        description: "Secure Payment",
        order_id: razorOrder.id,
        theme: { color: "#ea580c" },
        handler: async (response) => {
          try {
            if (!response?.razorpay_payment_id)
              throw new Error("Invalid payment response");
            const verify = await API.post("/api/payments/verify", {
              orderId,
              ...response,
            });
            if (verify.data?.ok) {
              localStorage.removeItem("cart");
              navigate(`/payment-success/${orderId}`);
            } else throw new Error("Payment verification failed");
          } catch {
            navigate("/orders");
          }
        },
        modal: { ondismiss: () => toast.error("Payment cancelled") },
      });
      rzp.open();
      rzp.on("payment.failed", () =>
        toast.error("Payment failed. Please try again."),
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Checkout failed",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── RENDER ─────────── */
  return (
    /*
      overflow-x-hidden on root: clips any child that accidentally
      tries to be wider than the viewport on small screens.
      pb-[calc(88px+...)] reserves space for the mobile fixed bar.
    */
    <div className="min-h-screen bg-stone-50 overflow-x-hidden pb-[calc(88px+env(safe-area-inset-bottom,0px))] lg:pb-16">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500
                       hover:text-stone-800 transition-colors min-h-11 min-w-11 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline">Back</span>
          </button>
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-orange-600">Swad</span>
              <span className="text-stone-900">Best</span>
            </span>
          </Link>
          <div
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700
                          bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full shrink-0"
          >
            <Lock className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">Secure</span>
          </div>
        </div>
        {/* Step indicator — scrollable on very small screens */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2 text-xs font-semibold text-stone-400 overflow-x-auto scrollbar-hide">
          <span className="text-orange-600 whitespace-nowrap">Address</span>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-orange-600 whitespace-nowrap">Payment</span>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">Confirm</span>
        </div>
      </div>

      {/* ── Main form ── */}
      <form
        id={FORM_ID}
        onSubmit={handlePlaceOrder}
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-6"
      >
        {/*
          Grid: single column on mobile, two columns on lg+
          min-w-0 on both columns prevents grid blowout
        */}
        <div className="grid lg:grid-cols-[1fr_390px] gap-6 items-start">
          {/* ══════ LEFT ══════ */}
          <div className="space-y-5 min-w-0">
            {/* ── Delivery Address ── */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-4 sm:p-6 overflow-hidden">
              <SectionHeader
                icon={MapPin}
                title="Delivery Address"
                action={
                  !showForm && savedAddresses.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-orange-600
                                 hover:text-orange-500 transition-colors min-h-11 px-1 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" /> Add New
                    </button>
                  ) : showForm && savedAddresses.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-xs font-bold text-stone-500 hover:text-stone-700
                                 transition-colors min-h-11 px-1 whitespace-nowrap"
                    >
                      ← Use Saved
                    </button>
                  ) : null
                }
              />

              {/* Saved addresses */}
              {savedAddresses.length > 0 && !showForm && (
                <div className="space-y-2.5">
                  {savedAddresses.map((a) => (
                    <div
                      key={a._id}
                      onClick={() => setSelectedAddress(a._id)}
                      className={`
                        flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer
                        transition-all duration-150 overflow-hidden
                        ${
                          selectedAddress === a._id
                            ? "border-orange-500 bg-orange-50 shadow-sm shadow-orange-500/10"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }
                      `}
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${selectedAddress === a._id ? "border-orange-500" : "border-stone-300"}`}
                      >
                        {selectedAddress === a._id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-stone-800 truncate">
                          {a.name}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5 leading-relaxed wrap-break-words">
                          {a.house}, {a.street}
                          {a.landmark ? `, ${a.landmark}` : ""}
                          <br />
                          {a.city}, {a.state} – {a.pincode}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {a.phone}
                        </p>
                      </div>
                      {selectedAddress === a._id && (
                        <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* New address form */}
              {showForm && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingLoc}
                    className="inline-flex items-center gap-2 text-xs font-bold text-orange-600
                               hover:text-orange-500 transition-colors disabled:opacity-60 min-h-11"
                  >
                    {detectingLoc ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />{" "}
                        Detecting…
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5 shrink-0" />{" "}
                        Auto-detect my location
                      </>
                    )}
                  </button>

                  {/*
                    Address grid:
                    - Single column on mobile (< sm)
                    - Two columns on sm+
                    - Each Field has min-w-0 + w-full to stay in bounds
                  */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Full Name"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      required
                    />
                    <Field
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      type="tel"
                      required
                    />
                    <Field
                      label="House / Flat No."
                      name="house"
                      value={form.house}
                      onChange={onChange}
                      required
                    />
                    <Field
                      label="Street / Area"
                      name="street"
                      value={form.street}
                      onChange={onChange}
                      required
                    />
                    <Field
                      label="Landmark (optional)"
                      name="landmark"
                      value={form.landmark}
                      onChange={onChange}
                    />
                    <Field
                      label="Pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={onChange}
                      required
                    />
                    <Field
                      label="City"
                      name="city"
                      value={form.city}
                      onChange={onChange}
                      required
                    />
                    <Field
                      label="State"
                      name="state"
                      value={form.state}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={saveAddress}
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-white
                               text-sm font-bold flex items-center justify-center gap-2
                               transition-all shadow-sm shadow-orange-600/20 disabled:opacity-60
                               active:scale-[0.99] touch-manipulation"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      "Save & Use This Address"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* ── Payment Method ── */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-4 sm:p-6 overflow-hidden">
              <SectionHeader icon={CreditCard} title="Payment Method" />
              <div className="space-y-3">
                <PaymentOption
                  value="Online"
                  selected={form.paymentMethod === "Online"}
                  onChange={onChange}
                  icon={Smartphone}
                  label="Pay Online"
                  badge="No extra charge"
                  sublabel="UPI · Debit/Credit Card · Net Banking · Wallets"
                />
                <PaymentOption
                  value="COD"
                  selected={form.paymentMethod === "COD"}
                  onChange={onChange}
                  icon={Banknote}
                  label="Cash on Delivery"
                  sublabel={`Pay when your order arrives · +₹${COD_CHARGE} handling fee`}
                />
              </div>
              <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 overflow-hidden">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 font-medium leading-snug wrap-break-words min-w-0">
                  100% secure · Your card details are never stored on our
                  servers
                </p>
              </div>
            </div>

            {/* ── Mobile inline order summary ── */}
            <div className="lg:hidden bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 pt-5 pb-4 border-b border-stone-100">
                <SectionHeader icon={Package} title="Order Summary" />
                <div className="space-y-3">
                  {cart.map((item, i) => (
                    <CartItemRow key={i} item={item} />
                  ))}
                </div>
              </div>
              <div className="px-4 sm:px-5 py-4">
                <PricingBreakdown
                  pricing={pricing}
                  pricingLoading={pricingLoading}
                  paymentMethod={form.paymentMethod}
                />
              </div>
              <div className="mx-4 sm:mx-5 mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 overflow-hidden">
                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-medium truncate">
                  Estimated delivery in 3–6 business days
                </p>
              </div>
            </div>
          </div>
          {/* end LEFT */}

          {/* ══════ RIGHT — Desktop sidebar ══════ */}
          <div className="hidden lg:block lg:sticky lg:top-22.5 h-fit space-y-3 min-w-0">
            <NudgeBanner nudge={pricing.nudge} />

            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-stone-100">
                <SectionHeader icon={Package} title="Order Summary" />
                <div className="space-y-3">
                  {cart.map((item, i) => (
                    <CartItemRow key={i} item={item} />
                  ))}
                </div>
              </div>
              <div className="px-5 py-4">
                <PricingBreakdown
                  pricing={pricing}
                  pricingLoading={pricingLoading}
                  paymentMethod={form.paymentMethod}
                />
              </div>
              <div className="mx-5 mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  Estimated delivery in 3–6 business days
                </p>
              </div>

              {/* Desktop CTA */}
              <div className="px-5 pb-5">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`
                    w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2
                    transition-all duration-200 touch-manipulation
                    ${
                      canSubmit
                        ? "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/25 active:scale-[0.99]"
                        : "bg-stone-100 text-stone-400 cursor-not-allowed"
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {form.paymentMethod === "COD"
                          ? "Place Order"
                          : `Pay ${fmt(pricing.totalAmount)} Securely`}
                      </span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <p className="text-[10px] text-stone-400 truncate">
                    256-bit SSL encrypted · Powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ══════════════════════════════════════════════
          MOBILE STICKY BOTTOM CTA
          Hides when Android keyboard is open.
          type="submit" form={FORM_ID} submits outside the DOM form.
      ══════════════════════════════════════════════ */}
      <div
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 z-30
          bg-white border-t border-stone-100
          shadow-[0_-4px_20px_rgba(0,0,0,0.10)]
          px-4 pt-3
          transition-transform duration-200
          ${keyboardOpen ? "translate-y-full" : "translate-y-0"}
        `}
        style={{
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Nudge — truncated on very small screens */}
        {pricing.nudge && (
          <div className="flex items-center gap-1.5 mb-2 overflow-hidden">
            {pricing.nudge.type === "first_order" ? (
              <Gift className="w-3 h-3 text-orange-500 shrink-0" />
            ) : (
              <TrendingUp className="w-3 h-3 text-amber-600 shrink-0" />
            )}
            <p className="text-[11px] font-bold text-amber-800 truncate">
              {pricing.nudge.text}
            </p>
          </div>
        )}

        <MobileStepGuard
          selectedAddress={selectedAddress}
          paymentMethod={form.paymentMethod}
        />

        {/* Price + CTA row — flex with proper shrink control */}
        <div className="flex items-center gap-3">
          {/* Price — takes remaining space, shrinks if needed */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider leading-none mb-0.5 truncate">
              Total Payable
            </p>
            <p className="text-xl font-black text-stone-900 leading-none truncate">
              {fmt(pricing.totalAmount)}
            </p>
            {pricing.gstAmount > 0 && (
              <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                Incl. ₹{pricing.gstAmount} GST
              </p>
            )}
            {pricing.isFirstOrder && pricing.deliverySaved > 0 && (
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5 truncate">
                You save ₹{pricing.deliverySaved} 🎉
              </p>
            )}
          </div>

          {/* CTA — fixed width, never shrinks */}
          <button
            type="submit"
            form={FORM_ID}
            disabled={!canSubmit}
            className={`
              shrink-0 h-12 px-4 sm:px-5 rounded-xl text-sm font-bold
              flex items-center justify-center gap-1.5
              transition-all duration-200
              touch-manipulation select-none
              ${
                canSubmit
                  ? "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 active:scale-[0.98]"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed"
              }
            `}
            style={{ minWidth: "140px" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span className="truncate">Processing…</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {form.paymentMethod === "COD" ? "Place Order" : "Pay Now"}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-2">
          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
          <p className="text-[10px] text-stone-400">
            Secure checkout · 256-bit SSL
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
