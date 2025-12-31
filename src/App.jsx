// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Loader from "./Components/Loader";
import ProtectedRoute from "./Components/ProtectedRoute";
import AuthProvider from "./context/AuthProvider";
import useAuth from "./Hooks/useAuth";

// Pages
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import ProductDetail from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import OrderDetails from "./Pages/OrderDetails";
import Profile from "./Pages/Profile";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import PayNow from "./Pages/PayNow";

// Auth / Recovery
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

// Email / OTP
import VerifyEmail from "./Pages/VerifyEmail";
import Verify from "./Pages/Verify";
import VerifyOTP from "./Pages/VerifyOTP";

/* ---------------- Layout ---------------- */

function Layout({ children }) {
  const location = useLocation();

  const hideLayoutPaths = [
    "/verify-email",
  ];

  const hideLayout =
    hideLayoutPaths.includes(location.pathname) ||
    location.pathname.startsWith("/verify/") ||
    location.pathname.startsWith("/verifyOtp");

  return (
    <div className="flex flex-col min-h-screen bg-orange-50">
      {!hideLayout && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideLayout && <Footer />}
    </div>
  );
}

/* ---------------- Routes ---------------- */

function AppRoutes() {
  const { loading } = useAuth();

  // ⏳ block app until auth state is restored
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
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* Email / OTP (public) */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verifyOtp" element={<VerifyOTP />} />


        {/* Recovery */}
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route path="/order/:id" element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
          } />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paynow/:orderId"
          element={
            <ProtectedRoute>
              <PayNow />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-orange-600">
                404 - Page Not Found
              </h2>
              <p className="text-gray-600 mt-2">
                The page you’re looking for doesn’t exist.
              </p>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
}

/* ---------------- App Root ---------------- */

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
