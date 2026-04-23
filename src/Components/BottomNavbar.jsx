import { Link, useLocation } from "react-router-dom";
import { Home, Package, Heart, ShoppingBag, User } from "lucide-react";

const NAV = [
  { to: "/",         label: "Home",    Icon: Home,        exact: true  },
  { to: "/orders",   label: "Orders",  Icon: Package,     exact: false },
  { to: "/wishlist", label: "Wishlist",Icon: Heart,       exact: false },
  { to: "/cart",     label: "Cart",    Icon: ShoppingBag, exact: false, showBadge: true },
  { to: "/account",  label: "Account", Icon: User,        exact: false,
    matchPaths: ["/account", "/profile", "/addresses"] },
];

export default function BottomNav({ cartCount = 0, wishlistCount = 0 }) {
  const { pathname } = useLocation();

  const isActive = (item) => {
    if (item.exact) return pathname === item.to;
    const paths = item.matchPaths ?? [item.to];
    return paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  };

  const getBadge = (item) => {
    if (item.to === "/cart")     return cartCount;
    if (item.to === "/wishlist") return wishlistCount;
    return 0;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-100 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {NAV.map((item) => {
          const active = isActive(item);
          const badge  = getBadge(item);
          const { Icon } = item;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                relative flex flex-col items-center justify-center gap-1
                transition-colors duration-150 active:bg-stone-50
                ${active ? "text-orange-600" : "text-stone-400"}
              `}
            >
              {/* Active top pill */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-orange-600" />
              )}

              {/* Icon + badge */}
              <span className="relative">
                <Icon
                  className={`transition-all ${active ? "w-5 h-5 scale-110" : "w-5 h-5"}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-16 h-4 px-1 bg-orange-600 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none shadow-sm">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>

              {/* Label */}
              <span className={`text-[10px] font-semibold tracking-wide leading-none ${active ? "text-orange-600" : "text-stone-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}