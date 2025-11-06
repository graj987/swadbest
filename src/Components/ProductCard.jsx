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
    <div className="bg-white border border-orange-100 rounded-xl shadow-sm hover:shadow-md transition flex flex-col overflow-hidden group">
      {/* Product Image */}
      <Link to={`/products/${product._id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1 flex-1">{product.category}</p>

        {/* Price */}
        <p className="text-orange-600 font-bold mt-2 text-lg">₹{product.price}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 bg-orange-500 text-white text-center py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            View
          </Link>

          <button
            onClick={handleAddToCart}
            className="flex-1 border border-orange-500 text-orange-600 font-semibold rounded-lg py-2 hover:bg-orange-100 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
