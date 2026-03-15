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
  Leaf,
} from "lucide-react";

/* ─────────────────────────────────────────────
   FIELD INPUT
───────────────────────────────────────────── */
function Field({ label, name, value, onChange, placeholder, type = "text", required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold uppercase tracking-[0.12em] text-stone-400">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          h-10 px-3.5 rounded-xl border text-sm text-stone-800 bg-white outline-none transition-all duration-150
          placeholder:text-stone-300
          ${focused ? "border-orange-400 ring-3 ring-orange-400/15 shadow-sm" : "border-stone-200 hover:border-stone-300"}
        `}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAYMENT OPTION
───────────────────────────────────────────── */
function PaymentOption({ value, selected, onChange, icon: Icon, label, sublabel }) {
  return (
    <label className={`
      flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150
      ${selected
        ? "border-orange-500 bg-orange-50 shadow-sm shadow-orange-500/10"
        : "border-stone-200 bg-white hover:border-stone-300"}
    `}>
      <input type="radio" name="paymentMethod" value={value} checked={selected} onChange={onChange} className="sr-only" />
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-orange-100" : "bg-stone-100"}`}>
        <Icon className={`w-4.5 h-4.5 ${selected ? "text-orange-600" : "text-stone-500"}`} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${selected ? "text-orange-700" : "text-stone-700"}`}>{label}</p>
        {sublabel && <p className="text-xs text-stone-400 mt-0.5">{sublabel}</p>}
      </div>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
        ${selected ? "border-orange-500" : "border-stone-300"}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-orange-500" />}
      </div>
    </label>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-orange-600" strokeWidth={2} />
        </div>
        <h3 className="text-[13px] font-black uppercase tracking-[0.12em] text-stone-500">{title}</h3>
      </div>
      {action}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Checkout = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [cart,             setCart]             = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [savedAddresses,   setSavedAddresses]   = useState([]);
  const [selectedAddress,  setSelectedAddress]  = useState(null);
  const [showForm,         setShowForm]         = useState(false);
  const [detectingLoc,     setDetectingLoc]     = useState(false);
  const [pricingLoading,   setPricingLoading]   = useState(false);
  const [pricing, setPricing] = useState({
    subtotal: 0, tax: 0, deliveryCharge: 0, codCharge: 0, totalAmount: 0,
  });

  const abortRef = useRef(null);

  const [form, setForm] = useState({
    name: "", phone: "", house: "", street: "",
    landmark: "", pincode: "", city: "", state: "", paymentMethod: "",
  });

  /* ── load cart ── */
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await API.get("/api/cart");
        const items = res.data?.items || [];
        if (!items.length) { navigate("/cart"); return; }
        setCart(items);
      } catch { toast.error("Failed to load cart"); }
      setForm((f) => ({ ...f, name: user?.name || "", phone: user?.phone || "" }));
    };
    loadCart();
  }, [navigate, user]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ── fetch saved addresses ── */
  const fetchSaved = useCallback(async () => {
    try {
      const res = await API.get("/api/address/getadd");
      if (res.data.success) {
        setSavedAddresses(res.data.data);
        if (res.data.data.length) { setSelectedAddress(res.data.data[0]._id); setShowForm(false); }
        else setShowForm(true);
      }
    } catch { toast.error("Failed to load saved addresses"); }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  /* ── build products payload ── */
  const buildProductsPayload = useCallback(() => {
    if (!cart.length) throw new Error("Cart empty");
    return cart.map((item) => {
      if (!item.product?._id) throw new Error("Invalid product");
      const variantIndex = item.variantIndex ?? item.product.variants?.findIndex((v) => v.weight === item.variant?.weight);
      if (variantIndex < 0) throw new Error("Variant not found");
      if (!item.quantity || item.quantity <= 0) throw new Error("Invalid quantity");
      return { product: item.product._id, variantIndex, quantity: item.quantity };
    });
  }, [cart]);

  /* ── price preview ── */
  const updatePricePreview = useCallback(async (signal) => {
    if (!selectedAddress || !form.paymentMethod || !cart.length) return;
    try {
      setPricingLoading(true);
      const products = buildProductsPayload();
      const res = await API.post("/api/orders/price-preview",
        { products, addressId: selectedAddress, paymentMethod: form.paymentMethod },
        { signal }
      );
      if (res.data?.success && res.data?.data) setPricing(res.data.data);
      else throw new Error("Invalid pricing response");
    } catch (err) {
      if (err.name === "CanceledError") return;
      setPricing({ subtotal: 0, tax: 0, deliveryCharge: 0, codCharge: 0, totalAmount: 0 });
    } finally {
      setPricingLoading(false);
    }
  }, [cart.length, selectedAddress, form.paymentMethod, buildProductsPayload]);

  useEffect(() => {
    if (!selectedAddress || !form.paymentMethod || !cart.length) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => updatePricePreview(controller.signal), 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [updatePricePreview, cart.length, selectedAddress, form.paymentMethod]);

  /* ── detect location ── */
  const detectLocation = async () => {
    if (!navigator.geolocation) { toast.error("Location not supported"); return; }
    setDetectingLoc(true);
    toast.info("Detecting your location…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.address || {};
          setForm((f) => ({ ...f, city: addr.city || addr.town || "", state: addr.state || "", pincode: addr.postcode || "" }));
          toast.success("Location detected. Please verify.");
        } catch { toast.error("Unable to fetch address"); }
        finally { setDetectingLoc(false); }
      },
      () => { toast.error("Location permission denied"); setDetectingLoc(false); }
    );
  };

  /* ── save address ── */
  const saveAddress = async () => {
    const required = ["name", "phone", "house", "street", "pincode", "city", "state"];
    for (const r of required) { if (!form[r]) return toast.error(`Please fill in: ${r}`); }
    if (!/^\d{6}$/.test(form.pincode)) return toast.error("Invalid 6-digit pincode");
    try {
      setLoading(true);
      const res = await API.post("/api/address/add", form);
      if (!res.data.success) return toast.error(res.data.message);
      toast.success("Address saved successfully");
      await fetchSaved();
    } catch { toast.error("Failed to save address"); }
    finally { setLoading(false); }
  };

  /* ── place order ── */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!selectedAddress) return toast.error("Please select a delivery address");
    if (!form.paymentMethod) return toast.error("Please select a payment method");

    try {
      setLoading(true);
      if (!cart.length) throw new Error("Cart empty");
      const products = buildProductsPayload();

      if (form.paymentMethod === "COD") {
        const res = await API.post("/api/orders/postorders", { products, addressId: selectedAddress, paymentMethod: "COD" });
        if (!res.data?.success) throw new Error(res.data?.message || "Order failed");
        toast.success("Order placed successfully!");
        localStorage.removeItem("cart");
        navigate("/orders");
        return;
      }

      const orderRes = await API.post("/api/orders/postorders", { products, addressId: selectedAddress, paymentMethod: "Online" });
      if (!orderRes.data?.success) throw new Error("Order creation failed");
      const orderId = orderRes.data?.order?._id || orderRes.data?.orderId || orderRes.data?._id || orderRes.data?.data?._id;
      if (!orderId) throw new Error("Order ID not returned from server");

      const paymentRes = await API.post("/api/payments/create-order", { orderId });
      if (!paymentRes.data?.ok || !paymentRes.data?.razorpayOrder) throw new Error("Failed to initiate payment");

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
            if (!response?.razorpay_payment_id) throw new Error("Invalid payment response");
            const verify = await API.post("/api/payments/verify", { orderId, ...response });
            if (verify.data?.ok) { localStorage.removeItem("cart"); navigate(`/payment-success/${orderId}`); }
            else throw new Error("Payment verification failed");
          } catch { navigate("/orders"); }
        },
        modal: { ondismiss: () => toast.error("Payment cancelled") },
      });
      rzp.open();
      rzp.on("payment.failed", () => toast.error("Payment failed. Try again."));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const canPreview = selectedAddress && form.paymentMethod;
  const fmt = (v) => `₹${(v || 0).toLocaleString("en-IN")}`;

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-stone-50 pb-28 sm:pb-16">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <Link to="/" className="flex items-center">
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-orange-600">Swad</span>
              <span className="text-stone-900">Best</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3" /> Secure
          </div>
        </div>

        {/* step indicator */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2 text-xs font-semibold text-stone-400">
          <span className="text-orange-600">Address</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-orange-600">Payment</span>
          <ChevronRight className="w-3 h-3" />
          <span>Confirm</span>
        </div>
      </div>

      {/* ── Main form ── */}
      <form onSubmit={handlePlaceOrder} className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">

          {/* ══════ LEFT ══════ */}
          <div className="space-y-5">

            {/* ── Delivery Address ── */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 sm:p-6">
              <SectionHeader
                icon={MapPin}
                title="Delivery Address"
                action={
                  !showForm && savedAddresses.length > 0 ? (
                    <button type="button" onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-500 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add New
                    </button>
                  ) : showForm && savedAddresses.length > 0 ? (
                    <button type="button" onClick={() => setShowForm(false)}
                      className="text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors">
                      Use Saved
                    </button>
                  ) : null
                }
              />

              {/* Saved address list */}
              {savedAddresses.length > 0 && !showForm && (
                <div className="space-y-2.5">
                  {savedAddresses.map((a) => (
                    <div
                      key={a._id}
                      onClick={() => setSelectedAddress(a._id)}
                      className={`
                        flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150
                        ${selectedAddress === a._id
                          ? "border-orange-500 bg-orange-50 shadow-sm shadow-orange-500/10"
                          : "border-stone-200 hover:border-stone-300 bg-white"}
                      `}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                        ${selectedAddress === a._id ? "border-orange-500" : "border-stone-300"}`}>
                        {selectedAddress === a._id && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-stone-800">{a.name}</p>
                        <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                          {a.house}, {a.street}{a.landmark ? `, ${a.landmark}` : ""}
                          <br />{a.city}, {a.state} – {a.pincode}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">{a.phone}</p>
                      </div>
                      {selectedAddress === a._id && (
                        <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* New address form */}
              {showForm && (
                <div className="space-y-4">
                  {/* Auto-detect */}
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingLoc}
                    className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-500 transition-colors disabled:opacity-60"
                  >
                    {detectingLoc
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting…</>
                      : <><Navigation className="w-3.5 h-3.5" /> Auto-detect my location</>
                    }
                  </button>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Full Name" name="name" value={form.name} onChange={onChange} required />
                    <Field label="Phone" name="phone" value={form.phone} onChange={onChange} type="tel" required />
                    <Field label="House / Flat No." name="house" value={form.house} onChange={onChange} required />
                    <Field label="Street / Area" name="street" value={form.street} onChange={onChange} required />
                    <Field label="Landmark (optional)" name="landmark" value={form.landmark} onChange={onChange} />
                    <Field label="Pincode" name="pincode" value={form.pincode} onChange={onChange} required />
                    <Field label="City" name="city" value={form.city} onChange={onChange} required />
                    <Field label="State" name="state" value={form.state} onChange={onChange} required />
                  </div>

                  <button
                    type="button"
                    onClick={saveAddress}
                    disabled={loading}
                    className="w-full h-10 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-orange-600/20 disabled:opacity-60"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save & Use This Address"}
                  </button>
                </div>
              )}
            </div>

            {/* ── Payment Method ── */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 sm:p-6">
              <SectionHeader icon={CreditCard} title="Payment Method" />

              <div className="space-y-2.5">
                <PaymentOption
                  value="Online"
                  selected={form.paymentMethod === "Online"}
                  onChange={onChange}
                  icon={Smartphone}
                  label="Pay Online"
                  sublabel="UPI · Debit/Credit Card · Net Banking · Wallets"
                />
                <PaymentOption
                  value="COD"
                  selected={form.paymentMethod === "COD"}
                  onChange={onChange}
                  icon={Banknote}
                  label="Cash on Delivery"
                  sublabel="Pay when your order arrives"
                />
              </div>

              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">
                  100% secure · No card data stored on our servers
                </p>
              </div>
            </div>
          </div>

          {/* ══════ RIGHT — Order Summary ══════ */}
          <div className="lg:sticky lg:top-[90px] h-fit space-y-4">
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">

              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-stone-100">
                <SectionHeader icon={Package} title="Order Summary" />

                {/* Cart items */}
                <div className="space-y-3">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl border border-stone-100 bg-stone-50 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.image
                          ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-1" />
                          : <Package className="w-4 h-4 text-stone-300" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-700 truncate">{item.product?.name}</p>
                        <p className="text-[11px] text-stone-400">
                          {item.variant?.weight && `${item.variant.weight} · `}Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-stone-800 shrink-0">
                        {fmt((item.variant?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="px-5 py-4 space-y-2">
                {pricingLoading ? (
                  <div className="flex items-center justify-center py-4 gap-2 text-stone-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Calculating…</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Subtotal</span>
                      <span>{fmt(pricing.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>GST</span>
                      <span>{fmt(pricing.tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Delivery</span>
                      <span>{pricing.deliveryCharge > 0 ? fmt(pricing.deliveryCharge) : <span className="text-emerald-600 font-semibold">Free</span>}</span>
                    </div>
                    {pricing.codCharge > 0 && (
                      <div className="flex justify-between text-sm text-stone-500">
                        <span>COD charge</span>
                        <span>{fmt(pricing.codCharge)}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between font-black text-stone-900 text-base pt-2 border-t border-stone-100">
                  <span>Total Payable</span>
                  <span>{fmt(pricing.totalAmount)}</span>
                </div>

                {!canPreview && (
                  <p className="text-[11px] text-stone-400 text-center pt-1">
                    Select address & payment to see final price
                  </p>
                )}
              </div>

              {/* Delivery note */}
              <div className="mx-5 mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">Estimated delivery in 3–6 business days</p>
              </div>

              {/* Desktop CTA */}
              <div className="hidden lg:block px-5 pb-5">
                <button
                  type="submit"
                  disabled={loading || !selectedAddress || !form.paymentMethod}
                  className={`
                    w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2
                    transition-all duration-200
                    ${loading || !selectedAddress || !form.paymentMethod
                      ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                      : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/25 hover:shadow-orange-500/30 active:scale-[0.99]"}
                  `}
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    : <><Lock className="w-4 h-4" />{form.paymentMethod === "COD" ? "Place Order" : `Pay ${fmt(pricing.totalAmount)} Securely`}<ArrowRight className="w-4 h-4" /></>
                  }
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <p className="text-[10px] text-stone-400">256-bit SSL encrypted · Powered by Razorpay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ══════ MOBILE STICKY CTA ══════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1">
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Total Payable</p>
            <p className="text-lg font-black text-stone-900 leading-tight">{fmt(pricing.totalAmount)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddress || !form.paymentMethod}
            className={`
              flex-1 h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2
              transition-all duration-200
              ${loading || !selectedAddress || !form.paymentMethod
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 active:scale-[0.99]"}
            `}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              : <><Lock className="w-4 h-4" />{form.paymentMethod === "COD" ? "Place Order" : "Pay Now"}</>
            }
          </button>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <p className="text-[10px] text-stone-400">Secure checkout · 256-bit SSL</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;