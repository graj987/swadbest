// src/App.jsx
import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./Layout/Layout";

import Loader from "./Components/Loader";
import ProtectedRoute from "./Components/ProtectedRoute";
import AuthProvider from "./context/AuthProvider";
import useAuth from "./Hooks/useAuth";

// Pages
const Home = lazy(() => import("./Pages/Home"));
const Products = lazy(() => import("./Pages/Products"));
const ProductDetail = lazy(() => import("./Pages/ProductDetails"));
const Cart = lazy(() => import("./Pages/Cart"));
const Checkout = lazy(() => import("./Pages/Checkout/Checkout"));
const Orders = lazy(() => import("./Pages/Orders"));
const OrderDetails = lazy(() => import("./Pages/OrderDetails"));
const OrderConfirmation = lazy(() => import("./Pages/OrderConfirmation"));
const Profile = lazy(() => import("./Pages/Profile"));
const Contact = lazy(() => import("./Pages/Contact"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));
const PayNow = lazy(() => import("./Pages/PayNow"));
const Account = lazy(() => import("./Pages/Account"));
const Address = lazy(() => import("./Pages/Address"));

const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword"));

const VerifyEmail = lazy(() => import("./Pages/VerifyEmail"));
const Verify = lazy(() => import("./Pages/Verify"));
const VerifyOTP = lazy(() => import("./Pages/VerifyOTP"));

const Wishlist = lazy(() => import("./Pages/Wishlist"));
const AboutUs = lazy(() => import("./Pages/About"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"));
const Terms = lazy(() => import("./Pages/Terms"));
const RefundPolicy = lazy(() => import("./Pages/Refund"));
const BlogDetails = lazy(() => import("./Pages/BlogDetail"));
const PaymentSuccess = lazy(() => import("./Pages/PaymentSuccess"));

const TrackPage = lazy(() => import("./Pages/TrackPage"));

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
       <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader />
      </div>
    }
  >
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
      </Suspense>
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