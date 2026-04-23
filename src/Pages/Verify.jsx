// src/pages/Verify.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, ShieldCheck, XCircle, Leaf, ArrowRight } from "lucide-react";
import API from "@/api";

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | failed

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) { setStatus("failed"); return; }
      try {
        const res = await API.get(`/api/users/verify?token=${token}`);
        if (res.data?.success) {
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full maxw[400px]">

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

        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-10 text-center">

          {/* ── LOADING ── */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-amber-600 animate-spin" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-900">Verifying your email</h2>
                <p className="text-sm text-stone-400 mt-1.5">Please wait a moment…</p>
              </div>
              {/* pulsing progress bar */}
              <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-8 h-8 text-emerald-600" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-900">Email Verified!</h2>
                <p className="text-sm text-stone-400 mt-1.5 leading-relaxed">
                  Your account is now active. Redirecting you to sign in…
                </p>
              </div>

              {/* auto-redirect progress */}
              <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ animation: "fill-bar 3s linear forwards" }}
                />
              </div>
              <style>{`
                @keyframes fill-bar { from { width: 0% } to { width: 100% } }
              `}</style>

              <button
                onClick={() => navigate("/login")}
                className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/25 active:scale-[0.99]"
              >
                Go to Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── FAILED ── */}
          {status === "failed" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-900">Verification Failed</h2>
                <p className="text-sm text-stone-400 mt-1.5 leading-relaxed">
                  This link is invalid or has expired. Request a new one from the login page.
                </p>
              </div>

              <div className="w-full space-y-2.5 pt-1">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/25 active:scale-[0.99]"
                >
                  Go to Sign In <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full h-11 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-all"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Need help?{" "}
          <Link to="/contact" className="text-amber-700 font-semibold hover:text-amber-600 transition-colors">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Verify;