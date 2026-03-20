import React, { useEffect, useRef, useState, memo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "@/Hooks/useAuth";
import {
  Heart,
  ShoppingBag,
  Search,
  X,
  ChevronDown,
  Package,
  User,
  LogOut,
  Phone,
  Info,
  ShieldCheck,
  ArrowLeft,
  Truck,
  Menu,
} from "lucide-react";
import useCartCount from "@/Hooks/useCartCount";
import API from "@/api";

/* ─────────────────────────────────────────────
   BADGE
───────────────────────────────────────────── */
const Badge = memo(({ value }) => (
  <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 bg-amber-600 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none shadow-sm">
    {value > 99 ? "99+" : value}
  </span>
));

/* ─────────────────────────────────────────────
   PROFILE MENU ITEM
───────────────────────────────────────────── */
const ProfileItem = memo(({ to, icon, text, danger, onClick }) => {
  const Icon = icon;
  const cls = `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
    ${
      danger
        ? "text-red-600 hover:bg-red-50"
        : "text-stone-700 hover:bg-stone-50"
    }`;
  if (onClick)
    return (
      <button onClick={onClick} className={`w-full text-left ${cls}`}>
        <Icon className="w-4 h-4 opacity-60" />
        {text}
      </button>
    );
  return (
    <Link to={to} className={cls}>
      <Icon className="w-4 h-4 opacity-60" />
      {text}
    </Link>
  );
});

/* ─────────────────────────────────────────────
   SEARCH SUGGESTION ROW
───────────────────────────────────────────── */
const SuggestionRow = memo(({ item, onSelect }) => (
  <Link
    to={`/products/${item._id}`}
    onClick={onSelect}
    className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50/60 transition-colors group"
  >
    <div className="w-10 h-10 rounded-xl border border-stone-100 bg-stone-50 overflow-hidden shrink-0 flex items-center justify-center">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-contain p-1"
      />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-stone-800 truncate group-hover:text-amber-700 transition-colors">
        {item.name}
      </p>
      <p className="text-xs text-stone-400">{item.category}</p>
    </div>
    {item.variants?.[0]?.price && (
      <p className="ml-auto text-sm font-black text-stone-800 shrink-0">
        ₹{item.variants[0].price}
      </p>
    )}
  </Link>
));

/* ═══════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════ */
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCartCount();

  const isAuth = !!user;
  const firstName = user?.name?.split(" ")[0] || "Account";
  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);
  const abortRef = useRef(null);

  /* close profile on outside click */
  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSuggestions([]);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => {
    setMobileMenu(false);
    setMobileSearch(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* prevent body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileMenu || mobileSearch ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu, mobileSearch]);

  /* ── search ── */
  const fetchSuggestions = useCallback(async (text) => {
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const res = await API.get(`/api/products/search?query=${text}`, {
        signal: abortRef.current.signal,
      });
      setSuggestions(res.data || []);
    } catch (err) {
      if (err.name !== "CanceledError") setSuggestions([]);
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
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setSuggestions([]);
    setMobileSearch(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ─────────── RENDER ─────────── */
  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* ── Logo ── */}
          <Link to="/" className="shrink-0 group">
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-orange-600 group-hover:text-orange-500 transition-colors">
                Swad
              </span>
              <span className="text-stone-900">Best</span>
            </span>
          </Link>

          {/* ── Desktop Search ── */}
          <div
            ref={searchRef}
            className="hidden md:flex relative flex-1 max-w-105"
          >
            <div
              className={`
              flex items-center w-full rounded-xl border bg-stone-50 px-3 gap-2
              transition-all duration-200
              ${searchFocused ? "border-amber-400 ring-3 ring-amber-400/15 bg-white shadow-sm" : "border-stone-200"}
            `}
            >
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                value={query}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search masala, pickles, snacks…"
                className="flex-1 py-2.5 text-sm bg-transparent outline-none text-stone-800 placeholder:text-stone-400"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="shrink-0 h-7 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
              >
                Go
              </button>
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50">
                <div className="px-4 py-2 border-b border-stone-50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {suggestions.length} result
                    {suggestions.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-stone-50">
                  {suggestions.map((item) => (
                    <SuggestionRow
                      key={item._id}
                      item={item}
                      onSelect={() => {
                        setQuery("");
                        setSuggestions([]);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <Link
              to="/products"
              className="px-3 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              Products
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && <Badge value={wishlistCount} />}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && <Badge value={cartCount} />}
            </Link>

            {/* Profile / Login */}
            {isAuth ? (
              <div ref={profileRef} className="relative ml-1">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className={`
                    flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-xl border transition-all
                    ${profileOpen ? "border-amber-300 bg-amber-50" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"}
                  `}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white bg-orange-600">
                    {avatarLetter}
                  </div>
                  <span className="text-sm font-semibold text-stone-700">
                    {firstName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-stone-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden z-50 py-1.5">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-stone-100 mb-1">
                      <p className="text-xs font-black text-stone-800">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    <ProfileItem to="/profile" icon={User} text="My Profile" />
                    <ProfileItem to="/orders" icon={Package} text="My Orders" />
                    <ProfileItem to="/track" icon={Truck} text="Track Order" />
                    <ProfileItem to="/wishlist" icon={Heart} text="Wishlist" />
                    <div className="my-1 border-t border-stone-100" />
                    <ProfileItem to="/about" icon={Info} text="About Us" />
                    <ProfileItem to="/contact" icon={Phone} text="Contact Us" />
                    <ProfileItem
                      to="/privacy"
                      icon={ShieldCheck}
                      text="Privacy Policy"
                    />
                    <div className="my-1 border-t border-stone-100" />
                    <ProfileItem
                      icon={LogOut}
                      text="Sign out"
                      danger
                      onClick={handleLogout}
                    />
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 h-9 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-sm shadow-amber-600/20 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* ── Mobile right cluster ── */}
          <div className="md:hidden flex items-center gap-1 ml-auto">
            {/* Search icon */}
            <button
              onClick={() => setMobileSearch(true)}
              className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && <Badge value={cartCount} />}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenu((v) => !v)}
              className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
            >
              {mobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ══════ MOBILE SEARCH OVERLAY ══════ */}
      {mobileSearch && (
        <div className="fixed inset-0 z-60 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
            <button
              onClick={() => {
                setMobileSearch(false);
                clearSearch();
              }}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search products…"
                className="flex-1 bg-transparent text-sm outline-none text-stone-800 placeholder:text-stone-400"
              />
              {query && (
                <button onClick={clearSearch}>
                  <X className="w-3.5 h-3.5 text-stone-400" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="h-10 px-4 rounded-xl bg-amber-600 text-white text-sm font-bold shrink-0"
            >
              Search
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 ? (
            <div className="flex-1 overflow-y-auto divide-y divide-stone-50">
              {suggestions.map((item) => (
                <SuggestionRow
                  key={item._id}
                  item={item}
                  onSelect={() => {
                    setQuery("");
                    setSuggestions([]);
                    setMobileSearch(false);
                  }}
                />
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
              <Search className="w-10 h-10 text-stone-200" />
              <p className="text-stone-500 font-medium text-sm">
                No results for "{query}"
              </p>
              <p className="text-stone-400 text-xs">Try a different keyword</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
              <Search className="w-10 h-10 text-stone-200" />
              <p className="text-stone-400 text-sm">Type to search products</p>
            </div>
          )}
        </div>
      )}

      {/* ══════ MOBILE MENU DRAWER ══════ */}
      {mobileMenu && (
        <div className="fixed inset-0 z-55 flex md:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenu(false)}
          />

          {/* drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-70 bg-white shadow-2xl flex flex-col overflow-y-auto">
            {/* drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <Link to="/" onClick={() => setMobileMenu(false)}>
                <span className="text-xl font-extrabold tracking-tight">
                  <span className="text-orange-600">Swad</span>
                  <span className="text-stone-900">Best</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileMenu(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            {/* user section */}
            {isAuth && (
              <div className="px-5 py-4 border-b border-stone-100 bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm bg-orange-600">
                    {avatarLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-stone-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* nav links */}
            <div className="flex-1 px-3 py-3 space-y-0.5">
              {[
                { to: "/products", icon: ShoppingBag, label: "All Products" },
                {
                  to: "/wishlist",
                  icon: Heart,
                  label: "Wishlist",
                  count: wishlistCount,
                },
                {
                  to: "/cart",
                  icon: ShoppingBag,
                  label: "Cart",
                  count: cartCount,
                },
                ...(isAuth
                  ? [
                      { to: "/orders", icon: Package, label: "My Orders" },
                      { to: "/track", icon: Truck, label: "Track Order" },
                      { to: "/profile", icon: User, label: "My Profile" },
                    ]
                  : []),
              ].map(({ to, icon, label, count }) => {
                const Icon = icon;
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                >
                  <Icon
                    className="w-4.5 h-4.5 text-stone-500"
                    strokeWidth={2}
                  />
                  {label}
                  {count > 0 && (
                    <span className="ml-auto text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </Link>;
              })}

              <div className="pt-2 pb-1 border-t border-stone-100 mt-2">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                  Info
                </p>
                {[
                  { to: "/about", icon: Info, label: "About Us" },
                  { to: "/contact", icon: Phone, label: "Contact Us" },
                  {
                    to: "/privacy",
                    icon: ShieldCheck,
                    label: "Privacy Policy",
                  },
                ].map(({ to, icon, label }) => {
                  const Icon =icon;
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                    {label}
                  </Link>;
                })}
              </div>
            </div>

            {/* footer actions */}
            <div className="px-4 py-4 border-t border-stone-100">
              {isAuth ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center h-11 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-600/20 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(Navbar);
