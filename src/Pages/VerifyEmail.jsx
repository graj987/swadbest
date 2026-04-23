// src/pages/VerifyEmail.jsx
import React from "react";
import { MailCheck, Leaf, ArrowRight, Inbox } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  /* Mask email for partial display: r*****@gmail.com */
  const maskedEmail = email
    ? email.replace(/^(.{1,2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(b.length, 4)) + c)
    : null;

  const TIPS = [
    { icon: Inbox,    text: "Check your spam or promotions folder"         },
    { icon: MailCheck,text: "Make sure the email address is correct"       },
    { icon: ArrowRight,text:"The link expires in 24 hours"                 },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full maxw[420px]">

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

        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Top accent */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #431407, #c2410c, #fb923c)" }} />

          <div className="p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-sm">
                  <MailCheck className="w-8 h-8 text-amber-600" strokeWidth={1.8} />
                </div>
                {/* pulse ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/30 animate-ping" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                Check your inbox
              </h1>
              <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                We've sent a verification link to your email address.
                Click it to activate your account.
              </p>
            </div>

            {/* Email display */}
            {email && (
              <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
                  <MailCheck className="w-4 h-4 text-amber-600" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Sent to</p>
                  <p className="text-sm font-bold text-stone-800 truncate">{maskedEmail}</p>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="space-y-2.5 mb-7">
              {TIPS.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Icon className="w-2.5 h-2.5 text-amber-700" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="space-y-2.5">
              <button
                onClick={() => navigate("/login")}
                className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/25 hover:shadow-amber-500/30 active:scale-[0.99]"
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
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Wrong email?{" "}
          <Link to="/register" className="text-amber-700 font-semibold hover:text-amber-600 transition-colors">
            Re-register
          </Link>
          {" · "}
          <Link to="/contact" className="text-amber-700 font-semibold hover:text-amber-600 transition-colors">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;