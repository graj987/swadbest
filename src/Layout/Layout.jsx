import { useLocation } from "react-router-dom";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import BottomNav from "@/Components/BottomNavbar";
import useCartCount from "@/Hooks/useCartCount";

function Layout({ children }) {
  const location = useLocation();
  const cartCount = useCartCount();

  const hideLayoutPaths = [
    "/verify-email",
  ];

  const hideLayout =
    hideLayoutPaths.includes(location.pathname) ||
    location.pathname.startsWith("/verify/") ||
    location.pathname.startsWith("/verifyOtp");

  return (
    <div className="flex flex-col min-h-screen bg-orange-50">
      {/* TOP NAVBAR */}
      {!hideLayout && <Navbar />}

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 ${
          !hideLayout ? "pb-16 md:pb-0" : ""
        }`}
      >
        {children}
      </main>

      {/* FOOTER (DESKTOP ONLY) */}
      {!hideLayout && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}

      {/* BOTTOM NAV (MOBILE ONLY) */}
      {!hideLayout && <BottomNav cartCount={cartCount} />}
    </div>
  );
}

export default Layout;
