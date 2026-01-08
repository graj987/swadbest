import React, { useState } from "react";
import API from "../api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await API.post("api/users/contact", formData);

      if (res.status === 200 || res.status === 201) {
        setStatus({
          type: "success",
          message: "Thanks for reaching out. We’ll get back to you shortly.",
        });
        setFormData({ name: "", email: "", message: "" });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white text-gray-800">
      
      {/* Header */}
      <section className="bg-orange-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-5 py-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-600">
            Contact Us
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Questions, feedback, or order-related support?  
            We’re here to help you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-5 py-16 grid gap-12 md:grid-cols-2">

        {/* FORM */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-1">Send us a message</h2>
          <p className="text-sm text-gray-500 mb-6">
            Fill out the form and our team will respond within 24–48 hours.
          </p>

          {status.message && (
            <StatusBanner status={status} />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
            />

            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />

            <TextAreaField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
            />

            <button
              type="submit"
              disabled={loading}
              className="
                w-full rounded-xl bg-orange-600 py-3
                font-semibold text-white
                transition hover:bg-orange-700
                disabled:opacity-60
              "
            >
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>

        {/* CONTACT INFO */}
        <div className="space-y-6">
          <InfoCard
            title="Our Office"
            text="SwadBest Foods Pvt. Ltd.
            Bharpura, Sonpur, Saran,
            Bihar – 841101"
          />

          <InfoCard
            title="Phone Support"
            text="+91 87093 97655"
          />

          <InfoCard
            title="Email Support"
            text="support@swadbest.com"
          />

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h3 className="font-semibold mb-3 text-orange-700">
              Quick Contact
            </h3>
            <div className="flex gap-3">
              <a
                href="https://wa.me/918709397655"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center rounded-lg bg-green-500 py-2 text-sm font-semibold text-white hover:bg-green-600 transition"
              >
                WhatsApp
              </a>
              <a
                href="mailto:support@swadbest.com"
                className="flex-1 text-center rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
              >
                Email Us
              </a>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Contact;

/* ---------- SMALL COMPONENTS ---------- */

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <input
        {...props}
        required
        className="
          w-full rounded-lg border border-gray-300
          px-3 py-2
          focus:ring-2 focus:ring-orange-400 outline-none
        "
      />
    </div>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <textarea
        {...props}
        required
        rows={5}
        className="
          w-full rounded-lg border border-gray-300
          px-3 py-2
          focus:ring-2 focus:ring-orange-400 outline-none
        "
      />
    </div>
  );
}

function StatusBanner({ status }) {
  return (
    <div
      className={`mb-4 rounded-lg px-4 py-2 text-sm ${
        status.type === "success"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status.message}
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 whitespace-pre-line">
        {text}
      </p>
    </div>
  );
}
