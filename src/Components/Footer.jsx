import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-gray-300 pt-14">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">SwadBest</h3>

          <p className="text-sm leading-relaxed text-gray-400">
            SwadBest Private Limited delivers authentic homemade Indian food
            prepared with traditional recipes, pure ingredients, and strict hygiene.
          </p>

          <p className="text-sm text-gray-500">
            Eat clean. Eat traditional. Eat SwadBest.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-orange-400 transition">Home</Link></li>
            <li><Link to="/products" className="hover:text-orange-400 transition">Products</Link></li>
            <li><Link to="/orders" className="hover:text-orange-400 transition">My Orders</Link></li>
            <li><Link to="/profile" className="hover:text-orange-400 transition">My Profile</Link></li>
            <li><Link to="/contact" className="hover:text-orange-400 transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Company & Policies */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            Company
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-orange-400 transition">
                About SwadBest
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-orange-400 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-orange-400 transition">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/refund" className="hover:text-orange-400 transition">
                Refund & Return Policy
              </Link>
            </li>
          </ul>

          {/* Trust microcopy */}
          <p className="mt-4 text-xs text-gray-500 leading-relaxed">
            FSSAI Certified Food Business • Made in India 🇮🇳
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            Contact Information
          </h4>

          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              📍 Bharpura, Sonpur,<br />
              Saran, Bihar – 841101
            </li>
            <li>📞 +91 8709397655</li>
            <li>✉️ support@swadbest.com</li>
          </ul>

          {/* Social */}
          <div className="flex gap-4 mt-5">
            {[
              {
                href: "https://www.facebook.com/swadbest",
                path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6v1.9h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12"
              },
              {
                href: "https://www.instagram.com/swadbest",
                path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z"
              },
              {
                href: "https://wa.me/918709397655",
                path: "M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.3A10 10 0 1 0 12 2zm5.2 14.6c-.2.6-1.1 1.1-1.7 1.2-.5.1-1.2.1-3.8-1.6-3.2-1.9-5.2-5.2-5.4-5.5-.2-.3-1.3-1.7-1.3-3.2 0-1.5.8-2.3 1.1-2.6.3-.3.7-.4 1-.4h.7c.2 0 .5-.1.8.6.3.7 1 2.5 1.1 2.7.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.6.6-.2.2-.4.4-.2.8.2.4 1 1.7 2.1 2.7 1.5 1.3 2.7 1.7 3.1 1.9.4.2.7.2 1 0 .3-.2 1.2-1.4 1.5-1.9.3-.5.6-.4 1-.3.4.1 2.5 1.2 2.9 1.4.4.2.7.3.8.4.1.1.1.6-.1 1.2z"
              }
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-orange-500 transition"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d={item.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 mt-12 py-5 text-center text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        <span className="text-white font-semibold">
          SwadBest Private Limited
        </span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
