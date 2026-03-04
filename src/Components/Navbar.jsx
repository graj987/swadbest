import React, {
  useEffect,
  useRef,
  useState,
  memo,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/Hooks/useAuth";
import { Heart, ShoppingBag } from "lucide-react";
import useCartCount from "@/Hooks/useCartCount";
import API from "@/api";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCartCount();

  const isAuth = !!user;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const profileRef = useRef(null);
  const searchTimeout = useRef(null);
  const abortRef = useRef(null);

  const firstName = user?.name?.split(" ")[0] || "Account";
  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

  /* ================= SEARCH ================= */

  const fetchSuggestions = useCallback(async (text) => {
    try {
      // cancel previous request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const res = await API.get(
        `/api/products/search?query=${text}`,
        { signal: abortRef.current.signal }
      );

      setSuggestions(res.data || []);
    } catch (err) {
      if (err.name !== "CanceledError") {
        setSuggestions([]);
      }
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      requestAnimationFrame(() => {
        fetchSuggestions(value);
      });
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ================= UI ================= */

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-orange-600">Swad</span>
            <span className="text-gray-900">Best</span>
          </Link>

          {/* SEARCH */}
          <div className="hidden md:flex relative w-[42%]">
            <input
              value={query}
              onChange={handleSearchChange}
              placeholder="Search for masala, pickles, snacks..."
              className="w-full rounded-l-full bg-orange-50/70 px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            />

            <button
              onClick={handleSearch}
              className="rounded-r-full bg-orange-600 px-6 text-white font-medium hover:bg-orange-700 transition"
            >
              Search
            </button>

            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-orange-100 max-h-64 overflow-auto will-change-transform">
                {suggestions.map((item) => (
                  <Link
                    key={item._id}
                    to={`/products/${item._id}`}
                    onClick={() => {
                      setQuery("");
                      setSuggestions([]);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-orange-50"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.category}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">

            <Link to="/products" className="hover:text-orange-600 transition">
              Products
            </Link>

            {/* WISHLIST */}
            <Link to="/wishlist" className="relative flex items-center">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge value={wishlistCount} />
              )}
            </Link>

            {/* CART */}
            <Link to="/cart" className="relative flex items-center gap-1">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && <Badge value={cartCount} />}
              <span className="hidden lg:inline">Cart</span>
            </Link>

            {/* PROFILE */}
            {isAuth ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 hover:bg-orange-50"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold">
                    {avatarLetter}
                  </div>
                  <span>{firstName}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-xl overflow-hidden">
                    <NavItem to="/profile" text="My Profile" />
                    <NavItem to="/orders" text="My Orders" />
                    <NavItem to="/wishlist" text="Wishlist" />
                    <NavItem to="/privacy" text="Privacy Policy" />
                    <NavItem to="/about" text="About Us" />
                    <NavItem to="/contact" text="Contact Us" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-orange-600 px-5 py-2 text-white font-semibold hover:bg-orange-700"
              >
                Login
              </Link>
            )}
          </div>

          {/* MOBILE SEARCH ICON */}
          <div className="md:hidden">
            <button onClick={() => setMobileSearch(true)}>🔍</button>
          </div>
        </div>
      </nav>

      {mobileSearch && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center gap-3 p-4 border-b">
            <button onClick={() => setMobileSearch(false)}>←</button>

            <input
              autoFocus
              value={query}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="flex-1 rounded-full bg-gray-100 px-4 py-2 outline-none"
            />

            <button onClick={handleSearch} className="text-orange-600">
              Go
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const Badge = memo(({ value }) => (
  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
    {value}
  </span>
));

const NavItem = memo(({ to, text }) => (
  <Link to={to} className="block px-4 py-2 text-sm hover:bg-gray-100">
    {text}
  </Link>
));

export default memo(Navbar);