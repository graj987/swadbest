import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 pt-20 relative overflow-hidden">
        {/* Newsletter */}
        {/* Newsletter */}
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <div className="relative rounded-3xl p-[2px] overflow-hidden">
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#f97316,#ec4899,#f97316)] bg-[length:200%_200%] animate-gradientMove" />

            {/* Inner Content */}
            <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-10 text-center text-white shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-bold">
                Get Wellness Tips & Exclusive Offers
              </h3>
              <p className="mt-3 text-white/90 text-sm">
                Ayurvedic insights, product updates & special discounts.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-5 py-3 rounded-full text-black w-full sm:w-72 outline-none"
                />
                <button className="bg-black px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <h3 className="text-3xl font-bold text-white tracking-wide">
              SwadBest
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Authentic homemade Indian products crafted with traditional
              recipes and pure ingredients.
            </p>
            <p className="text-xs text-gray-500">
              ✔ FSSAI Certified • Made in India 🇮🇳
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Home", to: "/" },
                { name: "Products", to: "/products" },
                { name: "My Orders", to: "/orders" },
                { name: "Profile", to: "/profile" },
                { name: "Contact", to: "/contact" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    className="hover:text-orange-500 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-5">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { name: "About Us", to: "/about" },
                { name: "Privacy Policy", to: "/privacy" },
                { name: "Terms & Conditions", to: "/terms" },
                { name: "Refund Policy", to: "/refund" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    className="hover:text-orange-500 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                📍 Bharpura, Sonpur,
                <br />
                Saran, Bihar – 841101
              </li>
              <li>📞 +91 8709397655</li>
              <li>✉️ support@swadbest.com</li>
            </ul>
          </div>
        </div>

        {/* Payments & Shipping */}
        <div className="max-w-7xl mx-auto px-6 mt-16 border-t border-gray-800 pt-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Secure Payments */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-5">
                Secure Payments
              </h4>
              <div className="flex flex-wrap gap-5">
                {[
                  { name: "Visa", file: "visa.png" },
                  { name: "Mastercard", file: "mastercard.png" },
                  { name: "UPI", file: "upi.png" },
                  { name: "Razorpay", file: "rozarpay.png" },
                ].map((item, i) => (
                  <img
                    key={i}
                    src={`/img/payments/${item.file}`}
                    alt={item.name}
                    className="h-6 object-contain opacity-70 hover:opacity-100 transition duration-300"
                  />
                ))}
              </div>
            </div>

            {/* Shipping Partners */}
            <div className="md:text-right">
              <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-5">
                Shipping Partners
              </h4>
              <div className="flex flex-wrap gap-5 md:justify-end">
                {[
                  { name: "Delhivery", file: "delhivery.png" },
                  { name: "Blue Dart", file: "bluedart.png" },
                  { name: "Shiprocket", file: "shiprocket.png" },
                ].map((item, i) => (
                  <img
                    key={i}
                    src={`/img/shipping/${item.file}`}
                    alt={item.name}
                    className="h-6 object-contain opacity-70 hover:opacity-100 transition duration-300"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-16 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()}{" "}
          <span className="text-white font-semibold">
            SwadBest Private Limited
          </span>
          . All rights reserved.
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/918709397655"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="relative flex items-center justify-center">
          {/* Soft Glow Background */}
          <span className="absolute w-16 h-16 rounded-full bg-green-400 blur-2xl opacity-40 group-hover:opacity-70 transition duration-500"></span>

          {/* Main Button */}
          <div
            className="relative flex items-center justify-center 
        w-14 h-14 rounded-full 
        bg-gradient-to-br from-[#25D366] to-[#128C7E] 
        shadow-[0_8px_25px_rgba(37,211,102,0.5)]
        hover:scale-110 hover:shadow-[0_10px_35px_rgba(37,211,102,0.7)]
        transition-all duration-300 animate-bounce-slow overflow-hidden"
          >
            <img
              src="/img/whatsapplogo.jpeg"
              alt="WhatsApp"
              className="w-14 h-14 object-contain drop-shadow-lg"
            />
          </div>

          {/* Glass Tooltip */}
          <div
            className="hidden sm:block absolute right-20 top-1/2 -translate-y-1/2
        backdrop-blur-md bg-white/20 text-white
        border border-white/30
        text-sm px-4 py-1.5 rounded-lg
        opacity-0 group-hover:opacity-100
        transition duration-300 whitespace-nowrap shadow-lg"
          >
            Chat with us
          </div>
        </div>
      </a>
    </>
  );
};

export default Footer;
