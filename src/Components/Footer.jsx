import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Leaf,
  Instagram,
  Facebook,
  Youtube,
  ArrowRight,
} from "lucide-react";

/* ─────────────────────────────────────────────
   TRUST BADGE ROW
───────────────────────────────────────────── */
const TRUST = [
  {
    icon: ShieldCheck,
    label: "FSSAI Certified",
    sub: "License No. 10023022000234",
  },
  { icon: Leaf, label: "No Preservatives", sub: "100% natural ingredients" },
  { icon: Truck, label: "Pan-India Delivery", sub: "Tracked & insured" },
  { icon: RotateCcw, label: "Easy Returns", sub: "7-day return policy" },
];

/* ─────────────────────────────────────────────
   FOOTER LINK
───────────────────────────────────────────── */
function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-center gap-1.5 text-sm text-stone-400 hover:text-white transition-colors duration-150"
      >
        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 text-orange-500" />
        {children}
      </Link>
    </li>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════ */
const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || subscribed) return;
    setSubLoading(true);
    setTimeout(() => {
      setSubscribed(true);
      setSubLoading(false);
    }, 1000);
  };

  return (
    <>
      <footer className="bg-[#0f0d0b] text-stone-300">
        {/* ══════ TRUST STRIP ══════ */}
        <div className="border-b border-white/5 bg-[#161210]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST.filter(Boolean).map((item) => {
              const Icon = item.icon;
              const { label, sub } = item;
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-600/15 border border-orange-600/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-orange-500" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                    {sub}
                  </p>
                </div>
              </div>;
            })}
          </div>
        </div>

        {/* ══════ NEWSLETTER ══════ */}
        <div className="border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-sm">
                <p className="text-[10px] uppercase tracking-[0.2em] text-orange-500/80 font-bold mb-1.5">
                  Stay in the loop
                </p>
                <h3 className="text-xl font-black text-white leading-tight">
                  Wellness tips & exclusive offers
                </h3>
                <p className="text-sm text-stone-500 mt-1.5">
                  Ayurvedic insights, new products & subscriber-only discounts.
                </p>
              </div>

              <form
                onSubmit={handleSubscribe}
                className="flex gap-2 w-full md:w-auto md:min-w-90"
              >
                {subscribed ? (
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/30 border border-emerald-700/40">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-sm text-emerald-400 font-semibold">
                      You're subscribed!
                    </p>
                  </div>
                ) : (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-stone-500 outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={subLoading}
                      className="h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold transition-all shadow-lg shadow-orange-600/20 shrink-0 disabled:opacity-60"
                    >
                      {subLoading ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                      ) : (
                        "Subscribe"
                      )}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* ══════ MAIN GRID ══════ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            {/* Logo */}
            <div>
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-orange-500">Swad</span>
                <span className="text-white">Best</span>
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mt-0.5">
                Private Limited
              </p>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed max-w-60">
              Authentic homemade Indian products crafted with traditional
              recipes and pure ingredients — since 2022.
            </p>

            {/* Made in India + FSSAI */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                🇮🇳 Made in India
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 text-orange-500" /> FSSAI
              </span>
            </div>

            {/* Social */}
            <div className="flex gap-2 pt-1">
              {[
                {
                  Icon: Instagram,
                  href: "https://instagram.com",
                  label: "Instagram",
                },
                {
                  Icon: Facebook,
                  href: "https://facebook.com",
                  label: "Facebook",
                },
                {
                  Icon: Youtube,
                  href: "https://youtube.com",
                  label: "YouTube",
                },
              ].map((item) => {
                const Icon = item.Icon;
                const { label, href } = item;
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white hover:bg-orange-600/20 hover:border-orange-600/30 transition-all"
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                </a>;
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/products">All Products</FooterLink>
              <FooterLink to="/orders">My Orders</FooterLink>
              <FooterLink to="/profile">My Account</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms & Conditions</FooterLink>
              <FooterLink to="/refund">Refund Policy</FooterLink>
              <FooterLink to="/shipping">Shipping Policy</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="w-3.5 h-3.5 text-orange-500/70 shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span className="text-sm text-stone-400 leading-relaxed">
                  Bharpura, Sonpur, Saran,
                  <br />
                  Bihar – 841101
                </span>
              </li>
              <li>
                <a
                  href="tel:+918709397655"
                  className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-white transition-colors group"
                >
                  <Phone
                    className="w-3.5 h-3.5 text-orange-500/70 shrink-0"
                    strokeWidth={2}
                  />
                  +91 87093 97655
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@swadbest.com"
                  className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-white transition-colors"
                >
                  <Mail
                    className="w-3.5 h-3.5 text-orange-500/70 shrink-0"
                    strokeWidth={2}
                  />
                  support@swadbest.com
                </a>
              </li>
            </ul>

            {/* WhatsApp inline CTA */}
            <a
              href="https://wa.me/918709397655"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 h-9 px-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 text-[#4ade80] text-xs font-bold hover:bg-[#25D366]/20 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#4ade80]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* ══════ PAYMENTS + SHIPPING ══════ */}
        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">
                Secure Payments
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {["visa.png", "mastercard.png", "upi.png", "rozarpay.png"].map(
                  (file, i) => (
                    <img
                      key={i}
                      src={`/img/payments/${file}`}
                      alt={file.split(".")[0]}
                      className="h-5 object-contain opacity-50 hover:opacity-90 transition-opacity duration-200 grayscale hover:grayscale-0"
                    />
                  ),
                )}
              </div>
            </div>
            <div>
              <p className="text-sm flex items-center gap-2">
                Crafted by 👨‍💻
                <a
                  href="https://your-portfolio-link.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-orange-500 hover:text-amber-300"
                >
                  Gautam Raj
                </a>
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">
                Shipping Partners
              </p>
              <div className="flex flex-wrap items-center gap-4 md:justify-end">
                {["delhivery.jpeg", "bluedart.png", "shiprocket.png"].map(
                  (file, i) => (
                    <img
                      key={i}
                      src={`/img/shipping/${file}`}
                      alt={file.split(".")[0]}
                      className="h-5 object-contain opacity-50 hover:opacity-90 transition-opacity duration-200 grayscale hover:grayscale-0"
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══════ BOTTOM BAR ══════ */}
        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-500 text-center sm:text-left">
              © {new Date().getFullYear()}{" "}
              <span className="text-stone-300 font-semibold">
                SwadBest Private Limited
              </span>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-500">
              <Link
                to="/privacy"
                className="hover:text-stone-300 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-stone-300 transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/refund"
                className="hover:text-stone-300 transition-colors"
              >
                Refund
              </Link>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════ FLOATING WHATSAPP ══════ */}
      <a
        href="https://wa.me/918709397655"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
        aria-label="Chat on WhatsApp"
      >
        {/* Tooltip */}
        <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          <div className="bg-stone-900 border border-white/10 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap">
            Chat with us
            <div className="absolute -right-1.25 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-stone-900 border-r border-t border-white/10 rotate-45" />
          </div>
        </div>

        {/* Button */}
        <div
          className="relative w-13 h-13 flex items-center justify-center"
          style={{ width: "52px", height: "52px" }}
        >
          {/* pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping" />
          <div className="relative w-full h-full rounded-full bg-linear-to-br from-[#25D366] to-[#128C7E] shadow-lg shadow-[#25D366]/30 flex items-center justify-center hover:scale-110 transition-transform duration-200">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </div>
      </a>
    </>
  );
};

export default Footer;
