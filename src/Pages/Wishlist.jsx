import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import useCartCount from "@/Hooks/useCartCount";

const Wishlist = () => {
  const { user, getAuthHeader } = useAuth();
  const { refetch } = useCartCount();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await API.get("/api/user/wishlist", {
        headers: getAuthHeader(),
      });
      setWishlist(data.products || []);
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeader]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = async (productId) => {
    try {
      await API.post(
        "/api/cart/wishlist/toggle",
        { productId },
        { headers: getAuthHeader() }
      );
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      refetch?.();
    } catch (err) {
      console.error("Remove wishlist failed", err);
    }
  };

  const moveToCart = async (productId) => {
    try {
      await API.post(
        "/api/cart/wishlist/move-to-cart",
        { productId, quantity: 1 },
        { headers: getAuthHeader() }
      );
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      refetch?.();
    } catch (err) {
      console.error("Move to cart failed", err);
      alert(err?.response?.data?.message || "Failed to move item");
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">Please login to view your wishlist</p>
        <Link
          to="/login"
          className="px-6 py-2 bg-orange-600 text-white rounded-lg"
        >
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Loading wishlist...
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Your wishlist is empty
        </h2>
        <p className="text-gray-500 mt-2">Add items you love. Buy later.</p>
        <Link
          to="/products"
          className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <Link to={`/products/${product._id}`}>
              <img
                src={product.image}
                alt={product.name}
                className="h-52 w-full object-cover rounded-t-2xl"
              />
            </Link>

            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">
                {product.name}
              </h3>

              <p className="text-orange-600 font-bold mt-1">
                ₹{product.price}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => moveToCart(product._id)}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                >
                  Move to Cart
                </button>

                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
