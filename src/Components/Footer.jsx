import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-orange-600 text-white py-10 px-6 mt-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div>
          <h3 className="text-2xl font-bold mb-3">SwadBest</h3>
          <p className="text-sm text-orange-100 leading-relaxed">
            Bringing the authentic homemade taste of India straight to your kitchen.
            Pure, flavorful, and made with love — just like home.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-orange-100">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/products" className="hover:text-white transition">Products</Link></li>
            <li><Link to="/orders" className="hover:text-white transition">My Orders</Link></li>
            <li><Link to="/profile" className="hover:text-white transition">My Profile</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Contact Info</h4>
          <ul className="space-y-2 text-sm text-orange-100">
            <li>📍 Patna, Bihar, India</li>
            <li>📞 +91 98765 43210</li>
            <li>✉️ support@swadbest.com</li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
          <div className="flex space-x-3">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-white/20 mt-8 pt-4 text-center text-sm text-orange-100">
        © {new Date().getFullYear()} <span className="font-semibold">SwadBest Foods</span>. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
