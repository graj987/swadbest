import { Link, useLocation } from "react-router-dom";

export default function BottomNav({ cartCount = 0 }) {
  const { pathname } = useLocation();

  const isActive = (paths) =>
    paths.some((path) => pathname === path || pathname.startsWith(path + "/"));

  const NavItem = ({ to, label, icon, active }) => (
    <Link
      to={to}
      className={`flex flex-col items-center text-xs transition-colors ${
        active ? "text-orange-600" : "text-gray-500"
      }`}
    >
      <span className="text-xl">{icon}</span>
      {label}
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 md:hidden">
      <div className="flex justify-around py-2">

        <NavItem
          to="/"
          label="Home"
          icon="🏠"
          active={pathname === "/"}
        />

        <NavItem
          to="/search"
          label="Search"
          icon="🔍"
          active={isActive(["/search", "/products"])}
        />

        <NavItem
          to="/wishlist"
          label="Wishlist"
          icon="❤️"
          active={isActive(["/wishlist"])}
        />

        {/* CART */}
        <Link
          to="/cart"
          className={`relative flex flex-col items-center text-xs ${
            isActive(["/cart"]) ? "text-orange-600" : "text-gray-500"
          }`}
        >
          <span className="text-xl">🛒</span>
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-1 right-2 text-[10px] bg-red-600 text-white px-1 rounded-full">
              {cartCount}
            </span>
          )}
        </Link>

        <NavItem
          to="/account"
          label="Account"
          icon="👤"
          active={isActive([
            "/account",
            "/profile",
            "/orders",
            "/addresses",
          ])}
        />

      </div>
    </nav>
  );
}
