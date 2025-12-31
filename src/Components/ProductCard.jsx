import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {

  const handleAddToCart = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = storedCart.find((item) => item._id === product._id);

    if (existing) {
      existing.quantity += 1;
    } else {
      storedCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(storedCart));
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white border border-orange-100 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden group">

      {/* PRODUCT IMAGE */}
      <Link to={`/products/${product._id}`}>
        <div className="relative">

          <img
            src={product.image}
            alt={product.name}
            className="h-60 w-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
          />

          {/* DISCOUNT */}
          {product.discount && (
            <span className="absolute top-3 left-3 bg-orange-600 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow">
              {product.discount}% OFF
            </span>
          )}

          {/* STOCK ALERT (NOW ON IMAGE) */}
          {product.stock <= 0 ? (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow">
              Out of Stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow">
              Only {product.stock} Left
            </span>
          ) : (
            <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow">
              In Stock
            </span>
          )}

        </div>
      </Link>

      {/* DETAILS */}
      <div className="p-4 flex flex-col gap-1">

        {/* TITLE */}
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* CATEGORY */}
        <p className="text-xs text-gray-500">{product.category}</p>

        {/* RATING */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-gray-700 text-sm font-medium">
            {product.rating || "4.5"}
          </span>
          <span className="text-gray-400 text-xs">
            ({product.totalReviews || "120"})
          </span>
        </div>

        {/* PRICING */}
        <div className="mt-2">
          <p className="text-xl font-bold text-orange-600">₹{product.price}</p>

          {product.originalPrice && (
            <p className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice}
            </p>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 mt-4">

          {/* VIEW */}
          <Link
            to={`/products/${product._id}`}
            className="flex-1 bg-orange-500 text-white text-center py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition shadow-sm"
          >
            View
          </Link>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            className="flex-1 border border-orange-500 text-orange-600 font-semibold rounded-xl py-2.5 hover:bg-orange-100 transition shadow-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
