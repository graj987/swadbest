import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/Hooks/useAuth";
import SafeImage from "@/Components/SafeImage";
import {
  User, MapPin, Package, ShoppingBag, Heart,
  Shield, Info, HelpCircle, Phone, Truck,
  LogOut, ChevronRight, Settings,
} from "lucide-react";

/* ─────────────────────────────────────────────
   MENU SECTIONS
───────────────────────────────────────────── */
const MENU = [
  {
    title: "Account",
    items: [
      { to: "/profile",  Icon: User,       label: "Manage Profile",    sub: "Edit name, phone & photo" },
      { to: "/address",  Icon: MapPin,      label: "Saved Addresses",   sub: "Manage delivery addresses" },
    ],
  },
  {
    title: "Shopping",
    items: [
      { to: "/orders",   Icon: Package,     label: "My Orders",         sub: "Track & manage your orders" },
      { to: "/track",    Icon: Truck,       label: "Track Order",       sub: "Live shipment tracking" },
      { to: "/cart",     Icon: ShoppingBag, label: "My Cart",           sub: "View items in your cart" },
      { to: "/wishlist", Icon: Heart,       label: "Wishlist",          sub: "Products you've saved" },
    ],
  },
  {
    title: "Info & Support",
    items: [
      { to: "/privacy",  Icon: Shield,      label: "Privacy Policy",    sub: "How we protect your data" },
      { to: "/about",    Icon: Info,        label: "About SwadBest",    sub: "Our story & mission" },
      { to: "/contact",  Icon: Phone,       label: "Contact Us",        sub: "Reach our support team" },
      { to: "/help",     Icon: HelpCircle,  label: "Help & FAQs",       sub: "Answers to common questions" },
    ],
  },
];

/* ─────────────────────────────────────────────
   MENU ITEM
───────────────────────────────────────────── */
function MenuItem({ to, Icon, label, sub }) {
  return (
    <Link to={to}
      className="group flex items-center gap-4 px-4 py-3.5 hover:bg-stone-50 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
        <Icon className="w-4 h-4 text-orange-600" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-stone-800 leading-snug">{label}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5 leading-snug">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

/* ═══════════════════════════════════════════
   ACCOUNT PAGE
═══════════════════════════════════════════ */
export default function Account() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#431407 0%,#7c2d12 50%,#c2410c 100%)" }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"180px" }} />

        <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 pt-10 pb-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/70 font-bold mb-6">My Account</p>

          {/* Profile row */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
                {user?.avatar ? (
                  <SafeImage src={user.avatar} alt={user.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-black text-white"
                    style={{ background:"linear-gradient(135deg,#431407,#c2410c)" }}>
                    {avatarLetter}
                  </div>
                )}
              </div>
              {/* Edit badge */}
              <Link to="/profile"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-md border border-stone-100">
                <Settings className="w-3 h-3 text-orange-600" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Name & email */}
            <div className="min-w-0">
              <p className="text-xl font-black text-white leading-tight truncate">
                {user?.name || "Welcome"}
              </p>
              <p className="text-white/50 text-sm mt-0.5 truncate">{user?.email}</p>
              {user?.phone && (
                <p className="text-white/40 text-xs mt-0.5">{user.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Menu sections ── */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-6 space-y-4 pb-6">
        {MENU.map(({ title, items }) => (
          <div key={title} className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Section title */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">{title}</p>
            </div>
            <div className="divide-y divide-stone-50">
              {items.map((item) => (
                <MenuItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 h-12 rounded-2xl bg-white border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-all shadow-sm active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
          Sign Out
        </button>

        {/* App version footer */}
        <p className="text-center text-[11px] text-stone-300 pb-2">
          SwadBest v1.0 · Made with ❤️ in India
        </p>
      </div>
    </div>
  );
}