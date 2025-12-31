import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import SafeImage from "../Components/SafeImage";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Failed to load product details.",err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);

    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });

    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-orange-50">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-orange-50">
        <p className="text-red-500">{error || "Product not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-20">

      {/* ======= MAIN SECTION ======= */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border border-orange-100 mt-8 grid md:grid-cols-2 gap-8">

        {/* PRODUCT IMAGE (Feature: Zoom on Hover) */}
        <div className="flex flex-col items-center gap-4">
          <div className="overflow-hidden rounded-xl shadow-md">
            <SafeImage
              src={product.image}
              alt={product.name}
              className="rounded-xl w-full max-w-sm h-auto object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2">
            {[product.image].map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="w-16 h-16 rounded-lg border object-cover cursor-pointer hover:opacity-80 transition"
              />
            ))}
          </div>
        </div>

        {/* ======= PRODUCT DETAILS ======= */}
        <div className="flex flex-col">

          {/* Minimal + Professional Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {product.name}
          </h1>

          <p className="text-xs text-gray-500 mb-3">{product.category}</p>

          {/* Description */}
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {product.description || "No description available."}
          </p>

          {/* Rating (Feature-Rich) */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500 text-lg">★</span>
            <p className="text-sm font-semibold text-gray-800">
              {product.rating || "4.5"}
            </p>
            <p className="text-xs text-gray-500">
              ({product.reviews || "215"} reviews)
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-5">
            <p className="text-3xl font-extrabold text-orange-600">
              ₹{product.price}
            </p>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-lg font-semibold">
              BEST PRICE
            </span>
          </div>

          {/* Specs */}
          <div className="space-y-2 text-sm text-gray-700 mb-5">
            {product.weight && (
              <p><strong>Weight:</strong> {product.weight}</p>
            )}
            {product.ingredients && (
              <p><strong>Ingredients:</strong> {product.ingredients}</p>
            )}
            {product.deliveryTime && (
              <p><strong>Delivery:</strong> {product.deliveryTime} days</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-orange-600 transition shadow"
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="flex-1 border border-orange-500 text-orange-600 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-orange-100 transition"
            >
              Go to Cart →
            </button>
          </div>
        </div>
      </div>

      {/* ======= YOU MAY ALSO LIKE ======= */}
      <div className="max-w-5xl mx-auto mt-12 px-3">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          You May Also Like
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <div className="bg-white h-40 border rounded-xl shadow-sm flex justify-center items-center text-gray-400">
            Coming Soon...
          </div>
        </div>
      </div>

      {/* ======= STICKY BOTTOM BAR (Feature-Rich) ======= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex sm:hidden gap-3">
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold text-sm"
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>

        <button
          onClick={() => navigate("/cart")}
          className="flex-1 border border-orange-500 text-orange-600 py-3 rounded-lg font-semibold text-sm"
        >
          Cart →
        </button>
      </div>

    </div>
  );
};

export default ProductDetail;
