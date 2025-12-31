import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
        setProfileOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    navigate("/login");
  };

  const firstName = user?.name?.split(" ")[0] || "Profile";
  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

return (
  <nav ref={navRef} className="sticky top-0 z-50 bg-white border-b shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

      {/* LOGO */}
      <Link to="/" className="flex items-center gap-1">
        <span className="text-2xl font-extrabold text-[oklch(0.705_0.213_47.604)]">
          Swad<span className="text-[oklch(0.21_0.034_264.665)]">Best</span>
        </span>
      </Link>

      {/* CATEGORY DROPDOWN */}
      <div className="hidden md:block relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[oklch(0.705_0.213_47.604)]"
        >
          Categories ▼
        </button>

        {menuOpen && (
          <div className="absolute mt-2 bg-white border rounded-lg shadow-lg w-52 py-2 z-50 animate-slideDown">
            {["Masala", "Pickles", "Snacks", "Ready Mix", "Dry Fruits"].map(
              (cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${cat.toLowerCase()}`}
                  className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat}
                </Link>
              )
            )}
          </div>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="hidden md:flex flex-1 mx-6 max-w-2xl">
        <div className="flex w-full bg-gray-100 rounded-lg overflow-hidden shadow-sm border">
          <input
            type="text"
            placeholder="Search masala, pickles, snacks..."
            className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
          />
          <button className="bg-[oklch(0.705_0.213_47.604)] text-white px-5 font-semibold hover:bg-[oklch(0.705_0.213_47.604)/85] transition">
            Search
          </button>
        </div>
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
            <span className="absolute -top-1 -right-2 bg-[oklch(0.705_0.213_47.604)] text-white text-xs px-1.5 py-0.5 rounded-full">
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
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </span>
              <span className="text-sm">{firstName}</span>
            </button>

            {/* DROPDOWN */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg py-2 text-sm animate-slideDown">
                <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-gray-100">My Profile</Link>
                <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                <Link to="/cart" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-gray-100">My Cart</Link>

                <div className="border-t my-1"></div>

                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
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

      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden text-3xl text-[oklch(0.705_0.213_47.604)] transition"
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>
    </div>

    {/* MOBILE MENU */}
    <div
      className={`md:hidden transition-all duration-300 overflow-hidden ${
        menuOpen ? "max-h-[450px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="bg-white border-t px-4 py-5 space-y-4 text-sm animate-slideDown">

        {/* MOBILE SEARCH */}
        <div className="flex w-full bg-gray-100 rounded-lg overflow-hidden shadow-sm">
          <input
            type="text"
            placeholder="Search masala, pickles, snacks..."
            className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
          />
          <button className="bg-[oklch(0.705_0.213_47.604)] text-white px-5 font-semibold">
            Go
          </button>
        </div>

        {/* CATEGORY SHORTCUT */}
        <div className="pt-2">
          <h4 className="font-semibold mb-2 text-gray-700">Categories</h4>
          <div className="grid grid-cols-2 gap-3">
            {["Masala", "Pickles", "Snacks", "Dry Fruits", "Ready Mix"].map(
              (cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${cat.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 bg-gray-100 px-3 py-2 rounded-lg text-center"
                >
                  {cat}
                </Link>
              )
            )}
          </div>
        </div>

        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>

        {isAuthenticated ? (
          <>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
            <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
            <button
              onClick={handleLogout}
              className="text-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  </nav>
);



};

export default Navbar;
