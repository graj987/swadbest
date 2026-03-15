import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight, Leaf, ShieldCheck, Star, Truck } from "lucide-react";
import API from "@/api";
import useAuth from "../Hooks/useAuth";

/* ─────────────────────────────────────────────
   REUSABLE FIELD WRAPPER
───────────────────────────────────────────── */
function Field({ label, id, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-semibold text-stone-700 tracking-wide">
          {label}
        </label>
        {hint}
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════ */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]               = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [focused, setFocused]         = useState(null);

  const emailRef = useRef(null);
  useEffect(() => { emailRef.current?.focus(); }, []);

  function onChange(e) {
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.email.trim() || !form.password.trim()) {
      setError("Both fields are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/api/users/login", form);

      if (!res.data?.success) {
        setError(res.data?.message || "Login failed.");
        return;
      }

      login({
        user:         res.data.user,
        accessToken:  res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });

      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.toLowerCase().includes("verify")) {
        setError("Your email is not verified. Please check your inbox.");
      } else {
        setError(msg || "Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* shared input className */
  const inputCls = (field) =>
    `w-full h-11 px-4 rounded-xl border text-sm text-stone-800 placeholder:text-stone-300
     bg-white outline-none transition-all duration-200
     ${focused === field
       ? "border-amber-500 ring-3 ring-amber-500/15 shadow-sm"
       : "border-stone-200 hover:border-stone-300"
     }`;

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen flex bg-stone-50">

      {/* ══════ LEFT BRAND PANEL ══════ */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #431407 0%, #7c2d12 45%, #c2410c 100%)" }}
      >
        {/* noise */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
        {/* glow orb */}
        <div
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #fb923c 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Leaf className="w-4 h-4 text-amber-300" strokeWidth={2} />
            </div>
            <span className="text-white font-black text-xl tracking-tight">Achwani</span>
          </div>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/70 font-semibold">
              Welcome back
            </p>
            <h2 className="text-[2.6rem] font-black leading-[1.08] text-white">
              Your pantry<br />is waiting<br />for you.
            </h2>
          </div>
          <p className="text-white/55 text-sm leading-relaxed max-w-xs">
            Sign in to track your orders, manage your address book,
            and reorder your favourite spices in seconds.
          </p>

          {/* feature pills */}
          <div className="space-y-2.5 pt-2">
            {[
              { icon: Truck,        text: "Track your live shipments"       },
              { icon: ShieldCheck,  text: "Secure account & order history"  },
              { icon: Star,         text: "Exclusive member discounts"       },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-amber-300" strokeWidth={2} />
                </div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10">
          <blockquote className="text-white/40 text-xs italic leading-relaxed border-l-2 border-white/20 pl-3">
            "Crafted in small batches the way our grandmothers intended."
          </blockquote>
        </div>
      </div>

      {/* ══════ RIGHT FORM PANEL ══════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-amber-600/10 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-amber-700" strokeWidth={2} />
            </div>
            <span className="font-black text-lg text-stone-800 tracking-tight">Achwani</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[1.75rem] font-black text-stone-900 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="text-stone-400 text-sm mt-1.5">
              New here?{" "}
              <Link to="/register" className="text-amber-700 font-semibold hover:text-amber-600 transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <div className="w-4 h-4 mt-0.5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-black leading-none">!</span>
              </div>
              <p className="text-sm text-red-700 font-medium leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">

            {/* Email */}
            <Field label="Email address" id="email">
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="rahul@example.com"
                value={form.email}
                onChange={onChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                className={inputCls("email")}
              />
            </Field>

            {/* Password */}
            <Field
              label="Password"
              id="password"
              hint={
                <Link
                  to="/forgotpassword"
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-600 transition-colors"
                >
                  Forgot password?
                </Link>
              }
            >
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                  className={`${inputCls("password")} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full h-12 rounded-xl text-sm font-bold tracking-wide mt-2
                flex items-center justify-center gap-2
                transition-all duration-200
                ${loading
                  ? "bg-amber-400/60 text-white cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 hover:shadow-amber-500/30 active:scale-[0.99]"}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Google",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ),
              },
              {
                label: "Phone",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className="h-11 flex items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all duration-150 shadow-sm"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}