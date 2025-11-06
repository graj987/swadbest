import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Loader from "./Components/Loader";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";


// Pages
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import ProductDetail from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import Profile from "./Pages/Profile";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import Register from "./Pages/Register";


function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-orange-50">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
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
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route (Optional) */}
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
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
