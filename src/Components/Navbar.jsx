import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/Hooks/useAuth";
import API from "@/api";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuth = !!user;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const searchTimeout = useRef(null);
  const profileRef = useRef(null);

  const firstName = user?.name?.split(" ")[0] || "User";
  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

  /* ================= SEARCH ================= */
  const fetchSuggestions = async (text) => {
    try {
      const res = await API.get(`/api/products/search?query=${text}`);
      setSuggestions(res.data || []);
    } catch {
      setSuggestions([]);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      value.trim() ? fetchSuggestions(value) : setSuggestions([]);
    }, 300);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/products?search=${query}`);
    setSuggestions([]);
    setMobileSearch(false);
  };

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="text-2xl font-extrabold">
            <span className="text-[oklch(0.705_0.213_47.604)]">
              Swad<span className="text-[oklch(0.21_0.034_264.665)]">Best</span>
            </span>
          </Link>

          {/* DESKTOP SEARCH */}
          <div className="hidden md:flex relative w-[45%]">
            <input
              value={query}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full px-4 py-2 bg-gray-100 rounded-l-full outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-6 bg-orange-600 text-white rounded-r-full"
            >
              Search
            </button>

            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-60 overflow-auto">
                {suggestions.map((item) => (
                  <Link
                    key={item._id}
                    to={`/products/${item._id}`}
                    onClick={() => {
                      setQuery("");
                      setSuggestions([]);
                    }}
                    className="flex gap-3 p-3 hover:bg-gray-50"
                  >
                    <img
                      src={item.image}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-5 text-sm">
            <Link to="/products" className="hover:text-orange-600">
              Products
            </Link>
            <Link to="/wishlist" className="text-xl">
              wishlist
           </Link>

            <Link to="/cart" className="text-xl">
              🛒
            </Link>

            {isAuth ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 border px-3 py-1.5 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-700">
                    {avatarLetter}
                  </div>
                  {firstName}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
                      Orders
                    </Link>
                    <Link
                      to="/privacy"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Privacy 
                    </Link>

                    <Link
                      to="/about"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      About Us
                    </Link>

                    <Link
                      to="/help"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Help & Support
                    </Link>

                    <Link
                      to="/contact"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Contact Us
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg"
              >
                Login
              </Link>
            )}
          </div>

          {/* MOBILE TOP BAR */}
          <div className="md:hidden flex items-center gap-3 text-xl">
            <button onClick={() => setMobileSearch(true)}>🔍</button>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE SEARCH OVERLAY ================= */}
      {mobileSearch && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="flex items-center gap-3 p-4 border-b">
            <button
              className="text-2xl"
              onClick={() => {
                setMobileSearch(false);
                setSuggestions([]);
              }}
            >
              ←
            </button>

            <input
              autoFocus
              value={query}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none"
            />

            <button
              onClick={handleSearch}
              className="text-orange-600 font-bold"
            >
              Go
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="max-h-[80vh] overflow-auto">
              {suggestions.map((item) => (
                <Link
                  key={item._id}
                  to={`/products/${item._id}`}
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    setMobileSearch(false);
                  }}
                  className="flex gap-3 p-4 border-b"
                >
                  <img
                    src={item.image}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
