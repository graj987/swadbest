import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(stored);
  }, []);

  // Remove item
  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((item) => item._id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  // Move to cart
  const moveToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exists = cart.find((item) => item._id === product._id);

    if (exists) {
      exists.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    removeFromWishlist(product._id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Your wishlist is empty
        </h2>
        <p className="text-gray-500 mt-2">
          Stop bookmarking dreams. Add products.
        </p>
        <Link
          to="/products"
          className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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
                  onClick={() => moveToCart(product)}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                >
                  Move to Cart
                </button>

                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                  title="Remove"
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
