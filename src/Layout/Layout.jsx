// src/Layout.jsx
import { useLocation } from "react-router-dom";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import BottomNav from "@/Components/BottomNavbar";
import useCartCount from "@/Hooks/useCartCount";

/* ─────────────────────────────────────────────
   Auth flows — completely hide Navbar/Footer/BottomNav
───────────────────────────────────────────── */
const HIDE_LAYOUT_EXACT = new Set([
  "/login",
  "/register",
  "/verify-email",
  "/verify",
  "/forgotpassword",
  "/reset-password",
]);

const HIDE_LAYOUT_PREFIX = ["/verifyOtp", "/verify/"];

function shouldHideLayout(pathname) {
  if (HIDE_LAYOUT_EXACT.has(pathname)) return true;
  return HIDE_LAYOUT_PREFIX.some((p) => pathname.startsWith(p));
}

/* ─────────────────────────────────────────────
   Footer hidden on conversion/payment pages
───────────────────────────────────────────── */
const HIDE_FOOTER_PREFIX = [
  "/checkout",
  "/cart",
  "/paynow/",
  "/payment-success/",
];

function shouldHideFooter(pathname) {
  return HIDE_FOOTER_PREFIX.some((p) => pathname.startsWith(p));
}

/* ─────────────────────────────────────────────
   BottomNav hidden when the page has its OWN
   fixed bottom bar (cart / checkout).
   Avoids double fixed bars stacking on mobile.
───────────────────────────────────────────── */
const HIDE_BOTTOMNAV_PREFIX = [
  "/cart",
  "/checkout",
  "/paynow/",
  "/payment-success/",
];

function shouldHideBottomNav(pathname) {
  return HIDE_BOTTOMNAV_PREFIX.some((p) => pathname.startsWith(p));
}

/* ═══════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════ */
function Layout({ children }) {
  const location = useLocation();
  const { cartCount, wishlistCount } = useCartCount();

  const pathname      = location.pathname;
  const hideLayout    = shouldHideLayout(pathname);
  const hideFooter    = hideLayout || shouldHideFooter(pathname);
  const hideBottomNav = hideLayout || shouldHideBottomNav(pathname);

  /*
    Bottom padding logic:
    - Auth pages:          no padding (hideLayout = true)
    - Cart / Checkout:     no padding here — those pages manage their own
                           pb-* internally (they have custom fixed bars)
    - All other pages:     pb-16 on mobile for BottomNav, 0 on desktop
  */
  const needsBottomNavPadding = !hideLayout && !hideBottomNav;

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 antialiased">

      {!hideLayout && <Navbar />}

      <main className={`flex-1 ${needsBottomNavPadding ? "pb-16 md:pb-0" : ""}`}>
        {children}
      </main>

      {!hideFooter && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}

      {!hideBottomNav && (
        <BottomNav cartCount={cartCount} wishlistCount={wishlistCount} />
      )}

    </div>
  );
}

export default Layout;