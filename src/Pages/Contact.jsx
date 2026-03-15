import React, { useState } from "react";
import API from "../api";
import {
  MapPin, Phone, Mail, MessageCircle,
  CheckCircle2, AlertCircle, Loader2, ArrowRight,
  Clock, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";

/* ─────────────────────────────────────────────
   FAQ DATA
───────────────────────────────────────────── */
const FAQS = [
  {
    q: "How long does delivery take?",
    a: "We deliver across India within 3–6 business days. Orders placed before 2 PM are usually dispatched the same day.",
  },
  {
    q: "Are your products free from preservatives?",
    a: "Yes. Every SwadBest product is made in small batches with no artificial preservatives, colours, or additives.",
  },
  {
    q: "Can I track my order?",
    a: "Absolutely. Once dispatched, you'll receive a tracking link via SMS and email. You can also track your order live from the My Orders page.",
  },
  {
    q: "What is your return / refund policy?",
    a: "We accept returns within 7 days of delivery for damaged or incorrect items. Contact us with your order ID and a photo and we'll resolve it within 24 hours.",
  },
  {
    q: "Do you offer bulk or wholesale orders?",
    a: "Yes! For bulk orders of 10+ units, WhatsApp us or email support@swadbest.com and we'll share our bulk pricing.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept UPI, all major debit/credit cards, net banking, wallets, and Cash on Delivery (COD) — all secured via Razorpay.",
  },
];

/* ─────────────────────────────────────────────
   FAQ ITEM
───────────────────────────────────────────── */
function FaqItem({ q, a, open, onToggle }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
        open ? "border-orange-200 shadow-sm shadow-orange-500/10" : "border-stone-100"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-stone-50 transition-colors"
      >
        <span className={`text-sm font-bold leading-snug ${open ? "text-orange-700" : "text-stone-800"}`}>{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4 bg-orange-50/40 border-t border-orange-100">
          <p className="text-sm text-stone-500 leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTACT INFO CARD
───────────────────────────────────────────── */
function InfoBlock({ icon, label, value, href }) {
  const Icon =icon;
  const content = (
    <div className="flex items-start gap-3 p-4 bg-white border border-stone-100 rounded-2xl shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-150 group">
      <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-orange-600" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">{label}</p>
        <p className="text-sm font-semibold text-stone-800 mt-0.5 leading-snug group-hover:text-orange-600 transition-colors whitespace-pre-line">{value}</p>
      </div>
      {href && <ExternalLink className="w-3.5 h-3.5 text-stone-300 group-hover:text-orange-400 shrink-0 mt-1 transition-colors" />}
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noopener noreferrer">{content}</a> : <div>{content}</div>;
}

/* ─────────────────────────────────────────────
   FIELD
───────────────────────────────────────────── */
function Field({ label, id, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-bold uppercase tracking-[0.12em] text-stone-400">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading,  setLoading]  = useState(false);
  const [status,   setStatus]   = useState({ type: "", message: "" });
  const [focused,  setFocused]  = useState(null);
  const [openFaq,  setOpenFaq]  = useState(null);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const res = await API.post("api/users/contact", formData);
      if (res.status === 200 || res.status === 201) {
        setStatus({ type: "success", message: "Thanks for reaching out! We'll get back to you within 24–48 hours." });
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      setStatus({ type: "error", message: "Something went wrong. Please try again or WhatsApp us directly." });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3.5 rounded-xl border text-sm text-stone-800 bg-white outline-none transition-all duration-150
     placeholder:text-stone-300
     ${focused === field
       ? "border-orange-400 ring-3 ring-orange-400/15 shadow-sm"
       : "border-stone-200 hover:border-stone-300"
     }`;

  /* ─────────── RENDER ─────────── */
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">

      {/* ══════ HERO ══════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #431407 0%, #7c2d12 50%, #c2410c 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/70 font-bold mb-3">
            We're here to help
          </p>
          <h1 className="text-[2.2rem] sm:text-5xl font-black text-white leading-tight">Contact Us</h1>
          <p className="mt-3 text-white/50 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Questions, order support, or wholesale enquiries — our team responds within 24 hours.
          </p>

          {/* Response time badge */}
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-white/80">Average response time: under 4 hours</span>
          </div>
        </div>
      </section>

      {/* ══════ MAIN CONTENT ══════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-[1fr_340px] gap-8">

        {/* ── LEFT: Form ── */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-black text-stone-900 tracking-tight">Send a message</h2>
          <p className="text-sm text-stone-400 mt-1 mb-6">
            Fill out the form and we'll get back within 24–48 hours.
          </p>

          {/* Status banner */}
          {status.message && (
            <div className={`mb-5 flex items-start gap-3 px-4 py-3 rounded-xl border ${
              status.type === "success"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}>
              {status.type === "success"
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              }
              <p className={`text-sm font-medium leading-snug ${
                status.type === "success" ? "text-emerald-700" : "text-red-700"
              }`}>{status.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" id="name" required>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                  placeholder="Your full name" required
                  className={`${inputCls("name")} h-11`} />
              </Field>

              <Field label="Email Address" id="email" required>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                  placeholder="you@example.com" required
                  className={`${inputCls("email")} h-11`} />
              </Field>
            </div>

            <Field label="Subject" id="subject">
              <select id="subject" name="subject" value={formData.subject} onChange={handleChange}
                onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                className={`${inputCls("subject")} h-11 cursor-pointer`}>
                <option value="">Select a topic…</option>
                <option value="order">Order / Tracking Issue</option>
                <option value="return">Return / Refund Request</option>
                <option value="product">Product Enquiry</option>
                <option value="wholesale">Wholesale / Bulk Order</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Message" id="message" required>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange}
                onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                placeholder="Describe your query in detail…" required rows={5}
                className={`${inputCls("message")} py-3 resize-none`} />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2
                transition-all duration-200
                ${loading
                  ? "bg-orange-400/60 text-white cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/25 hover:shadow-orange-500/30 active:scale-[0.99]"}
              `}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                : <>Send Message <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </div>

        {/* ── RIGHT: Info + Quick Contact ── */}
        <div className="space-y-3">

          <InfoBlock
            icon={MapPin}
            label="Our Office"
            value={`SwadBest Foods Pvt. Ltd.\nBharpura, Sonpur, Saran\nBihar – 841101`}
          />

          <InfoBlock
            icon={Phone}
            label="Phone Support"
            value="+91 87093 97655"
            href="tel:+918709397655"
          />

          <InfoBlock
            icon={Mail}
            label="Email Support"
            value="support@swadbest.com"
            href="mailto:support@swadbest.com"
          />

          <InfoBlock
            icon={Clock}
            label="Support Hours"
            value={`Mon – Sat: 9 AM – 7 PM\nSunday: 10 AM – 4 PM`}
          />

          {/* Quick contact */}
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-3">
              Quick Contact
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/918709397655"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
              <a
                href="mailto:support@swadbest.com"
                className="flex items-center justify-center gap-2 h-10 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
          </div>

          {/* Map embed placeholder */}
          <div className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm aspect-[4/3]">
            <iframe
              title="SwadBest Location"
              src="https://maps.google.com/maps?q=Sonpur,Saran,Bihar&output=embed"
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ══════ FAQ SECTION ══════ */}
      <section className="bg-white border-t border-stone-100 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-2">
              Quick Answers
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-400 text-sm mt-2">
              Can't find what you need?{" "}
              <a href="https://wa.me/918709397655" target="_blank" rel="noopener noreferrer"
                className="text-orange-600 font-semibold hover:text-orange-500 transition-colors">
                WhatsApp us
              </a>
            </p>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;