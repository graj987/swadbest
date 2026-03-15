// src/pages/VerifyOtp.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, ShieldCheck, Leaf, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import API from "@/api";

function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  /* ── guard ── */
  useEffect(() => {
    if (!email) {
      toast.error("Invalid verification link");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  /* ── resend countdown ── */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  /* ── digit input handling ── */
  const handleDigitChange = (i, val) => {
    const cleaned = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = cleaned;
    setDigits(next);
    setError("");
    if (cleaned && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, idx) => { next[idx] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otp = digits.join("");

  /* ── verify ── */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) { setError("Please enter all 6 digits."); return; }

    setLoading(true);
    try {
      const res = await API.post("/api/users/verify-otp", { email, otp });
      if (!res.data?.success || !res.data?.resetToken) throw new Error("Verification failed");
      toast.success("OTP verified successfully");
      navigate(`/reset-password?token=${encodeURIComponent(res.data.resetToken)}`, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Invalid or expired OTP";
      setError(msg);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /* ── resend ── */
  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setResending(true);
    try {
      await API.post("/api/users/resend-otp", { email });
      toast.success("OTP resent — check your inbox");
      setResendCooldown(30);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const filled = digits.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #431407, #c2410c)" }}>
              <Leaf className="w-4 h-4 text-amber-300" strokeWidth={2} />
            </div>
            <span className="font-black text-xl text-stone-800 tracking-tight">Achwani</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-8">

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-100">
              <ShieldCheck className="w-7 h-7 text-amber-600" strokeWidth={1.8} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Enter OTP</h1>
            <p className="text-sm text-stone-400 mt-1.5 leading-relaxed">
              We sent a 6-digit code to
            </p>
            {email && (
              <p className="text-sm font-bold text-stone-700 mt-0.5 truncate">{email}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <div className="w-4 h-4 mt-0.5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-black">!</span>
              </div>
              <p className="text-sm text-red-700 font-medium leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP inputs */}
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-3 text-center">
                One-Time Password
              </p>
              <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={loading}
                    className={`
                      w-11 h-13 text-center text-lg font-black rounded-xl border-2 outline-none
                      transition-all duration-150 bg-white
                      ${d ? "border-amber-500 text-stone-900 shadow-md shadow-amber-500/15" : "border-stone-200 text-stone-400"}
                      ${loading ? "opacity-50 cursor-not-allowed" : "hover:border-stone-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/15"}
                    `}
                    style={{ height: "52px" }}
                  />
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {digits.map((d, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${d ? "bg-amber-500" : "bg-stone-200"}`} />
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || filled < 6}
              className={`
                w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2
                transition-all duration-200
                ${loading || filled < 6
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 hover:shadow-amber-500/30 active:scale-[0.99]"
                }
              `}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
              ) : (
                <>Verify OTP <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center">
            <p className="text-xs text-stone-400">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className={`mt-1 inline-flex items-center gap-1.5 text-sm font-bold transition-colors
                ${resendCooldown > 0 || resending
                  ? "text-stone-400 cursor-not-allowed"
                  : "text-amber-700 hover:text-amber-600"
                }`}
            >
              {resending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                : resendCooldown > 0
                  ? <><RotateCcw className="w-3.5 h-3.5" /> Resend in {resendCooldown}s</>
                  : <><RotateCcw className="w-3.5 h-3.5" /> Resend OTP</>
              }
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Back to{" "}
          <Link to="/login" className="text-amber-700 font-semibold hover:text-amber-600 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;