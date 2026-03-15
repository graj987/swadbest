import { useLocation } from "react-router-dom";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import BottomNav from "@/Components/BottomNavbar";
import useCartCount from "@/Hooks/useCartCount";

/* ─────────────────────────────────────────────
   Paths where Navbar + Footer + BottomNav are hidden.
   Auth flows get a clean, distraction-free shell.
───────────────────────────────────────────── */
const HIDE_LAYOUT_EXACT = new Set([
  "/login",
  "/register",
  "/verify-email",
  "/verify",
  "/forgotpassword",
  "/reset-password",
]);

const HIDE_LAYOUT_PREFIX = [
  "/verifyOtp",
  "/verify/",
];

function shouldHideLayout(pathname) {
  if (HIDE_LAYOUT_EXACT.has(pathname)) return true;
  return HIDE_LAYOUT_PREFIX.some((p) => pathname.startsWith(p));
}

/* ─────────────────────────────────────────────
   Paths where the Footer is hidden even on desktop
   (checkout, payment flows — keep focus on conversion)
───────────────────────────────────────────── */
const HIDE_FOOTER_PREFIX = [
  "/checkout",
  "/paynow/",
  "/payment-success/",
];

function shouldHideFooter(pathname) {
  return HIDE_FOOTER_PREFIX.some((p) => pathname.startsWith(p));
}

/* ═══════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════ */
function Layout({ children }) {
  const location  = useLocation();
  const { cartCount, wishlistCount } = useCartCount();

  const pathname   = location.pathname;
  const hideLayout = shouldHideLayout(pathname);
  const hideFooter = hideLayout || shouldHideFooter(pathname);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 antialiased">

      {/* ── Navbar ── */}
      {!hideLayout && <Navbar />}

      {/* ── Page content ──
          pb-16 on mobile reserves space for the BottomNav bar (h-16).
          On md+ the BottomNav is hidden so no padding needed.       */}
      <main className={`flex-1 ${!hideLayout ? "pb-16 md:pb-0" : ""}`}>
        {children}
      </main>

      {/* ── Footer — desktop only, hidden on conversion pages ── */}
      {!hideFooter && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}

      {/* ── Bottom nav — mobile only ── */}
      {!hideLayout && (
        <BottomNav cartCount={cartCount} wishlistCount={wishlistCount} />
      )}
    </div>
  );
}

export default Layout;