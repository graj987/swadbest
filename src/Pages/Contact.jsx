import React from "react";
import { useState } from "react";
import axios from "axios";

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
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const res = await axios.post(
        "https://swadbackendserver.onrender.com/api/users/contact",
        formData
      );

      if (res.status === 200 || res.status === 201) {
        setStatus({
          type: "success",
          message: "Thank you! Your message has been sent successfully.",
        });
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Failed to send message. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
        <h2 className="text-3xl font-bold text-orange-600 text-center mb-2">
          Contact Us
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Have questions, feedback, or a custom order request? We’d love to hear
          from you!
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {status.message && (
              <div
                className={`text-center p-2 rounded-lg text-sm ${
                  status.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {status.message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Write your message..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          {/* Company Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-700 mb-4">
              SwadBest Contact Details
            </h3>
            <p className="text-gray-700 mb-3">
              📍 <strong>Address:</strong> SwadBest Foods Pvt. Ltd.,  
              12/4, Near MG Road, Patna, Bihar, India
            </p>
            <p className="text-gray-700 mb-3">
              📞 <strong>Phone:</strong> +91 87093 97655
            </p>
            <p className="text-gray-700 mb-3">
              ✉️ <strong>Email:</strong> support@swadbest.com
            </p>
            <div className="mt-6">
              <p className="text-gray-600 text-sm mb-2">
                You can also connect with us on:
              </p>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/918709397655"
                  target="_blank"
                  className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 text-sm"
                >
                  WhatsApp
                </a>
                <a
                  href="mailto:support@swadbest.com"
                  className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 text-sm"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
