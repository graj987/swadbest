import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import API from "@/api";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Smart Search
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchTimeout = useRef(null);

  const navRef = useRef(null);
  const profileRef = useRef(null);

  // OUTSIDE CLICK HANDLER
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setProfileOpen(false);
        setMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      setSuggestions([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const firstName = user?.name?.split(" ")[0] || "Profile";
  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

  // SMART SEARCH FUNCTIONS
  const fetchSuggestions = async (text) => {
    try {
      const res = await API.get(`/api/products/search?query=${text}`);
      setSuggestions(res.data);
    } catch (error) {
      console.error("Search Error:", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      if (value.trim()) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
      }
    }, 250);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/products?search=${searchQuery}`);
    setSuggestions([]);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav ref={navRef} className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-1">
            <span className="text-2xl font-extrabold text-[oklch(0.705_0.213_47.604)]">
              Swad<span className="text-[oklch(0.21_0.034_264.665)]">Best</span>
            </span>
          </Link>

          {/* DESKTOP SEARCH */}
          <div className="hidden md:flex flex-1 mx-6 relative">
            <div className="flex w-full max-w-xl bg-gray-100 rounded-full overflow-hidden shadow-sm border">
              <input
                type="text"
                placeholder="Search masala, pickles, snacks..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
              />
              <button
                onClick={handleSearch}
                className="bg-[oklch(0.705_0.213_47.604)] text-white px-5 font-semibold hover:bg-[oklch(0.705_0.213_47.604)/85] transition"
              >
                Search
              </button>
            </div>

            {/* SUGGESTIONS */}
            {suggestions.length > 0 && (
              <div className="absolute top-full mt-1 bg-white border shadow-xl rounded-lg w-full z-50 animate-fadeIn">
                {suggestions.map((item) => (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    onClick={() => {
                      setSuggestions([]);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100"
                  >
                    <img
                      src={item.image}
                      className="w-10 h-10 rounded object-cover"
                      alt=""
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

          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">

            <Link to="/products" className="hover:text-[oklch(0.705_0.213_47.604)]">
              Products
            </Link>

            {isAuthenticated && (
              <Link to="/orders" className="hover:text-[oklch(0.705_0.213_47.604)]">
                Orders
              </Link>
            )}

            {/* CART */}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-[oklch(0.705_0.213_47.604)] text-xl"
            >
              🛒
              {user?.cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {user.cartCount}
                </span>
              )}
            </Link>

            {/* PROFILE */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 border px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-[oklch(0.705_0.213_47.604)] flex items-center justify-center text-sm font-bold">
                    {avatarLetter}
                  </span>
                  <span className="text-sm">{firstName}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg py-2 text-sm animate-slideDown">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">My Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                    <Link to="/cart" className="block px-4 py-2 hover:bg-gray-100">My Cart</Link>

                    <div className="border-t my-1"></div>

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
              <>
                <Link to="/login" className="px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-[oklch(0.705_0.213_47.604)] text-white rounded-lg hover:bg-[oklch(0.705_0.213_47.604)/85]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-3xl text-[oklch(0.705_0.213_47.604)]"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* MOBILE SEARCH ALWAYS VISIBLE */}
      <div className="md:hidden px-4 py-3 bg-white border-b shadow-sm sticky top-[56px] z-40 animate-slideDown">
        <div className="flex w-full bg-gray-100 rounded-full overflow-hidden shadow-sm">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
          />
          <button
            onClick={handleSearch}
            className="bg-[oklch(0.705_0.213_47.604)] text-white px-5 text-sm font-semibold"
          >
            Go
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white border shadow-md rounded-lg mt-2 animate-fadeIn">
            {suggestions.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                onClick={() => {
                  setSuggestions([]);
                  setSearchQuery("");
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100"
              >
                <img src={item.image} className="w-10 h-10 rounded object-cover" />
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* PREMIUM MOBILE MENU OVERLAY */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className={`absolute left-0 top-0 h-full w-[75%] bg-white shadow-xl p-5 flex flex-col gap-4 transform transition-all duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-gray-700">Menu</h3>

          <Link to="/" onClick={() => setMenuOpen(false)} className="py-2 border-b">Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} className="py-2 border-b">Products</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="py-2 border-b">Contact</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)} className="py-2 border-b">Cart</Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="py-2 border-b" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/orders" className="py-2 border-b" onClick={() => setMenuOpen(false)}>Orders</Link>

              <button
                onClick={handleLogout}
                className="text-red-600 text-left py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="py-2 border-b" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="py-2 border-b" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
