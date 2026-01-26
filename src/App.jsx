// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
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
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import OrderDetails from "./Pages/OrderDetails";
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
import Wishlist from "./Pages/Wishlist";
import AboutUs from "./Pages/About";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import Terms from "./Pages/Terms";
import RefundPolicy from "./Pages/Refund";


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
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/address" element={<Address />} />
        <Route path="/about" element={<AboutUs/>}/>
        <Route path="/privacy" element={<PrivacyPolicy/>}/>
        <Route path="/terms" element={<Terms/>}/>
        <Route path="/refund" element={<RefundPolicy/>}/>



        {/* Email / OTP (public) */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verifyOtp" element={<VerifyOTP />} />


        {/* Recovery */}
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/wishlist" 
        element={
          <ProtectedRoute>
            <Wishlist/>
          </ProtectedRoute>
        }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
       <Route path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } 
        />

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
         
            <OrderDetails />
          
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
