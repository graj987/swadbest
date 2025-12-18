import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-orange-600">
            Swad<span className="text-gray-900">Best</span>
          </span>
        </Link>

        {/* Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="flex w-full bg-gray-100 rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search masala, pickles, snacks..."
              className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
            />
            <button className="bg-orange-500 text-white px-5 font-semibold hover:bg-orange-600 transition">
              Search
            </button>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-orange-600">Home</Link>
          <Link to="/products" className="hover:text-orange-600">Products</Link>
          {isAuthenticated && (
            <Link to="/orders" className="hover:text-orange-600">Orders</Link>
          )}
          <Link to="/contact" className="hover:text-orange-600">Contact</Link>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/cart" className="relative text-gray-700 hover:text-orange-600">
            🛒
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 border px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    avatarLetter
                  )}
                </span>
                <span className="hidden sm:block text-sm">{firstName}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden text-sm">
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-gray-100">
                    My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-gray-100">
                    My Orders
                  </Link>
                  <div className="border-t" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50">
                Login
              </Link>
              <Link to="/register" className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl" onClick={() => setMenuOpen(v => !v)}>
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3 text-sm">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
              <button onClick={handleLogout} className="text-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
