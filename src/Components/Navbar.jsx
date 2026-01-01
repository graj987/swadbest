import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/Hooks/useAuth";
import API from "@/api";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuth = !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);


  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const searchTimeout = useRef(null);
  const profileRef = useRef();
  const menuRef = useRef();

  const firstName = user?.name?.split(" ")[0] || "User";
  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

  /* ========================= SEARCH ========================= */
  const fetchSuggestions = async (text) => {
    try {
      const res = await API.get(`/api/products/search?query=${text}`);
      setSuggestions(res.data || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      if (value.trim()) fetchSuggestions(value);
      else setSuggestions([]);
    }, 250);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/products?search=${query}`);
    setSuggestions([]);
  };

  /* ======================= OUTSIDE CLICK ======================= */
  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);

      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ========================= LOGOUT ========================= */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ========================== JSX =========================== */
  return (
    <>
      <nav className="sticky top-0 bg-white shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

          {/* LOGO */}
          <Link to="/" className="text-2xl font-extrabold text-orange-600">
            <span className="text-2xl font-extrabold text-[oklch(0.705_0.213_47.604)]">
              Swad<span className="text-[oklch(0.21_0.034_264.665)]">Best</span>
            </span>
          </Link>

          {/* DESKTOP SEARCH */}
          <div className="hidden md:flex relative w-[40%]">
            <div className="flex w-full bg-gray-100 border rounded-full overflow-hidden">
              <input
                value={query}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
              />
              <button
                onClick={handleSearch}
                className="px-5 bg-orange-600 text-white text-sm"
              >
                Search
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="absolute top-full mt-1 bg-white w-full rounded-lg shadow-lg border z-50 max-h-60 overflow-auto">
                {suggestions.map((item) => (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    onClick={() => {
                      setQuery("");
                      setSuggestions([]);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100"
                  >
                    <img
                      src={item.image}
                      className="w-10 h-10 rounded object-cover"
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

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 text-sm">

            <Link to="/products" className="hover:text-orange-600">
              Products
            </Link>

            {isAuth && (
              <Link to="/orders" className="hover:text-orange-600">
                Orders
              </Link>
            )}

            {/* CART */}
            <Link to="/cart" className="relative text-xl">
              🛒
              {user?.cartCount > 0 && (
                <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                  {user.cartCount}
                </span>
              )}
            </Link>

            {/* PROFILE */}
            {isAuth ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 border px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-700">
                    {avatarLetter}
                  </div>
                  <span>{firstName}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 bg-white border shadow-lg w-48 rounded-lg mt-2 py-2">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                      My Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
                      My Orders
                    </Link>
                    <Link to="/cart" className="block px-4 py-2 hover:bg-gray-100">
                      Cart
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
              <>
                <Link to="/login" className="px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          {/* MOBILE SEARCH ICON */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-xl"
              onClick={() => setMobileSearch(true)}
            >
              🔍
            </button>

            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-2xl text-orange-600"
              onClick={() => setMenuOpen(v => !v)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>

        </div>
      </nav>

      {/* MOBILE SEARCH */}
      {/* MOBILE SEARCH OVERLAY */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full bg-white border-b shadow-lg z-50 transform transition-transform duration-300 ${mobileSearch ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="flex items-center gap-3 p-3">
          {/* BACK BUTTON */}
          <button
            className="text-2xl"
            onClick={() => {
              setMobileSearch(false);
              setSuggestions([]);
            }}
          >
            ←
          </button>

          {/* INPUT */}
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            autoFocus
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none text-sm"
            placeholder="Search products..."
          />

          <button
            onClick={handleSearch}
            className="text-xl text-orange-600 font-bold"
          >
            🔍
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white border-t max-h-72 overflow-auto">
            {suggestions.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setMobileSearch(false);
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
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


      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed inset-0 bg-black/40 transition duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          ref={menuRef}
          className={`absolute left-0 top-0 h-full w-[75%] bg-white shadow-xl p-5 transition-all duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <h3 className="text-lg font-bold mb-4">Menu</h3>

          <Link to="/" onClick={() => setMenuOpen(false)} className="py-2 border-b block">
            Home
          </Link>

          <Link to="/products" onClick={() => setMenuOpen(false)} className="py-2 border-b block">
            Products
          </Link>

          <Link to="/cart" onClick={() => setMenuOpen(false)} className="py-2 border-b block">
            Cart
          </Link>

          {isAuth ? (
            <>
              <Link to="/profile" className="py-2 border-b block" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/orders" className="py-2 border-b block" onClick={() => setMenuOpen(false)}>
                Orders
              </Link>
              <button
                onClick={handleLogout}
                className="py-2 text-red-600 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="py-2 border-b block" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link
                to="/register"
                className="py-2 border-b block"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
