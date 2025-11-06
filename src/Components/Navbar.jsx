import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    setIsLoggedIn(!!token);
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="bg-orange-600 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        
        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-extrabold tracking-wide">
          Swad<span className="text-yellow-300">Best</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-yellow-300 font-medium">
            Home
          </Link>
          <Link to="/products" className="hover:text-yellow-300 font-medium">
            Products
          </Link>
          {isLoggedIn && (
            <Link to="/orders" className="hover:text-yellow-300 font-medium">
              Orders
            </Link>
          )}
          <Link to="/contact" className="hover:text-yellow-300 font-medium">
            Contact
          </Link>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/cart" className="hover:text-yellow-300 font-medium">
            🛒 Cart
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="bg-white text-orange-600 px-3 py-1 rounded-lg font-semibold hover:bg-orange-100 transition"
              >
                {user?.name?.split(" ")[0] || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="border border-white px-3 py-1 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-white px-3 py-1 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-orange-600 px-3 py-1 rounded-lg font-semibold hover:bg-orange-100 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-orange-700 text-white px-4 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block py-1 border-b border-orange-500"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMenuOpen(false)}
            className="block py-1 border-b border-orange-500"
          >
            Products
          </Link>
          {isLoggedIn && (
            <Link
              to="/orders"
              onClick={() => setMenuOpen(false)}
              className="block py-1 border-b border-orange-500"
            >
              Orders
            </Link>
          )}
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="block py-1 border-b border-orange-500"
          >
            Contact
          </Link>
          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className="block py-1 border-b border-orange-500"
          >
            🛒 Cart
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block py-1 border-b border-orange-500"
              >
                {user?.name?.split(" ")[0] || "Profile"}
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left py-1 text-red-300 hover:text-red-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block py-1 border-b border-orange-500"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block py-1 border-b border-orange-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
