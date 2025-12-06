import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(
          `api/products/${id}`
        );
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = storedCart.find((item) => item._id === product._id);

    if (existing) {
      existing.quantity += 1;
    } else {
      storedCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(storedCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-orange-50">
        <p className="text-gray-600">Loading product details...</p>
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
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6 md:p-10 border border-orange-100 grid md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="flex justify-center items-center">
          <img
            src={product.image}
            alt={product.name}
            className="rounded-xl w-full max-w-md h-auto object-cover shadow-sm"
          />
        </div>

        {/* Product Details */}
        <div>
          <h2 className="text-3xl font-bold text-orange-600 mb-2">
            {product.name}
          </h2>
          <p className="text-gray-600 text-sm mb-4">{product.category}</p>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description || "No description available."}
          </p>

          <p className="text-2xl font-bold text-orange-700 mb-4">
            ₹{product.price}
          </p>

          {product.weight && (
            <p className="text-gray-600 text-sm mb-4">
              <strong>Weight:</strong> {product.weight}
            </p>
          )}

          {product.ingredients && (
            <p className="text-gray-600 text-sm mb-4">
              <strong>Ingredients:</strong> {product.ingredients}
            </p>
          )}

          {product.deliveryTime && (
            <p className="text-gray-600 text-sm mb-6">
              <strong>Delivery Time:</strong> {product.deliveryTime} days
            </p>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="border border-orange-500 text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-100 transition"
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section (Optional for later) */}
      {/* <div className="max-w-6xl mx-auto mt-12">
        <h3 className="text-xl font-bold text-orange-700 mb-4">
          You May Also Like
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          // Map your related products here
        </div>
      </div> */}
    </div>
  );
};

export default ProductDetail;
