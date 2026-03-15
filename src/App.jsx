// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./Layout/Layout";

import Loader from "./Components/Loader";
import ProtectedRoute from "./Components/ProtectedRoute";
import AuthProvider from "./context/AuthProvider";
import useAuth from "./Hooks/useAuth";

// Pages
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import ProductDetail from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout/Checkout";
import Orders from "./Pages/Orders";
import OrderDetails from "./Pages/OrderDetails";
import OrderConfirmation from "./Pages/OrderConfirmation";
import Profile from "./Pages/Profile";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import PayNow from "./Pages/PayNow";
import Account from "./Pages/Account";
import Address from "./Pages/Address";

// Auth / Recovery
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

// Email / OTP
import VerifyEmail from "./Pages/VerifyEmail";
import Verify from "./Pages/Verify";
import VerifyOTP from "./Pages/VerifyOTP";

// Other pages
import Wishlist from "./Pages/Wishlist";
import AboutUs from "./Pages/About";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import Terms from "./Pages/Terms";
import RefundPolicy from "./Pages/Refund";
import BlogDetails from "./Pages/BlogDetail";
import PaymentSuccess from "./Pages/PaymentSuccess";

// ✅ TrackPage is the standalone tracking PAGE (uses TrackOrder component internally)
// ❌ Do NOT import TrackOrder (the component) here — it's used inside TrackPage, not as a route
import TrackPage from "./Pages/TrackPage";

/* ─────────────────────────────────────────────
   ROUTES
───────────────────────────────────────────── */
function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader />
      </div>
    );
  }

  return (
    <Layout>
      <Routes>

        {/* ══════ PUBLIC ══════ */}
        <Route path="/"                         element={<Home />} />
        <Route path="/products"                 element={<Products />} />
        <Route path="/products/:id"             element={<ProductDetail />} />
        <Route path="/contact"                  element={<Contact />} />
        <Route path="/about"                    element={<AboutUs />} />
        <Route path="/privacy"                  element={<PrivacyPolicy />} />
        <Route path="/terms"                    element={<Terms />} />
        <Route path="/refund"                   element={<RefundPolicy />} />
        <Route path="/blogs/:slug"              element={<BlogDetails />} />
        <Route path="/address"                  element={<Address />} />

        {/* ✅ Track order — two routes:
            /track        → empty search box (user types AWB)
            /track/:awb   → opens tracking directly for that AWB */}
        <Route path="/track"                    element={<TrackPage />} />
        <Route path="/track/:awb"               element={<TrackPage />} />

        {/* Payment */}
        <Route path="/payment-success/:orderId" element={<PaymentSuccess />} />

        {/* Auth */}
        <Route path="/login"                    element={<Login />} />
        <Route path="/register"                 element={<Register />} />
        <Route path="/verify-email"             element={<VerifyEmail />} />
        <Route path="/verify"                   element={<Verify />} />
        <Route path="/verifyOtp"                element={<VerifyOTP />} />
        <Route path="/forgotpassword"           element={<ForgotPassword />} />
        <Route path="/reset-password"           element={<ResetPassword />} />

        {/* ══════ PROTECTED ══════ */}
        <Route path="/wishlist"   element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/account"    element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/cart"       element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout"   element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/orders"     element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/order/:id"  element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

        {/* ✅ Added OrderConfirmation route (was missing) */}
        <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

        <Route path="/paynow/:orderId" element={<ProtectedRoute><PayNow /></ProtectedRoute>} />

        {/* ══════ 404 ══════ */}
        <Route
          path="*"
          element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 gap-4">
              <p className="text-6xl font-black text-stone-200">404</p>
              <h2 className="text-xl font-black text-stone-800">Page not found</h2>
              <p className="text-stone-400 text-sm">The page you're looking for doesn't exist.</p>
              <a href="/" className="h-10 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold flex items-center transition-all">
                Back to Home
              </a>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;