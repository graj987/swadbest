// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";

export default function ForgotPassword() {
  const [email,       setEmail]       = useState("");
  const [isLoading,   setIsLoading]   = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email address");

    try {
      setIsLoading(true);
      const res = await API.post("/api/users/forgot-password", { email });

      if (res.data.success) {
        toast.success(res.data.message || "OTP sent to your email");
        setIsSubmitted(true);
        // Navigate after a short delay so user sees the success state first
        setTimeout(() => {
          navigate(`/verifyOtp?email=${encodeURIComponent(email)}`);
        }, 1800);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">

      {/* Card */}
      <div className="w-full max-w-md">

        {/* Back to login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Orange top accent */}
          <div className="h-1 bg-linear-to-r from-orange-600 to-orange-400" />

          {/* Content */}
          <div className="px-8 pt-8 pb-8">

            {/* Logo */}
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center">
                <span className="text-2xl font-extrabold tracking-tight">
                  <span className="text-orange-600">Swad</span>
                  <span className="text-stone-900">Best</span>
                </span>
              </Link>
            </div>

            {!isSubmitted ? (
              /* ── Request OTP state ── */
              <>
                {/* Heading */}
                <div className="mb-7">
                  <h1 className="text-xl font-black text-stone-900 tracking-tight mb-1.5">
                    Forgot your password?
                  </h1>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    No worries — enter your registered email and we'll send you a one-time code to reset it.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        autoFocus
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 text-sm text-stone-800
                                   bg-white outline-none transition-all duration-150 placeholder:text-stone-300
                                   focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15 focus:shadow-sm
                                   hover:border-stone-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className={`
                      w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2
                      transition-all duration-200
                      ${isLoading || !email.trim()
                        ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                        : "bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 active:scale-[0.99]"}
                    `}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</>
                    ) : (
                      "Send OTP"
                    )}
                  </button>

                </form>
              </>
            ) : (
              /* ── Success state ── */
              <div className="flex flex-col items-center text-center py-4 space-y-4">

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-black text-stone-900 tracking-tight">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
                    We sent a one-time code to{" "}
                    <span className="font-semibold text-stone-700">{email}</span>.
                    Redirecting you now…
                  </p>
                </div>

                {/* Loader dots */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>

                {/* Try different email */}
                <button
                  onClick={() => { setIsSubmitted(false); setEmail(""); }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400
                             hover:text-orange-600 transition-colors mt-2"
                >
                  <RotateCcw className="w-3 h-3" /> Use a different email
                </button>

              </div>
            )}

          </div>
        </div>

        {/* Footer link */}
        {!isSubmitted && (
          <p className="text-center text-sm text-stone-500 mt-5">
            Remember your password?{" "}
            <Link to="/login" className="font-bold text-orange-600 hover:text-orange-500 transition-colors">
              Sign in
            </Link>
          </p>
        )}

      </div>
    </div>
  );
}