import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import SafeImage from "../Components/SafeImage";
import useAuth from "../Hooks/useAuth";
import useCartCount from "../Hooks/useCartCount";
import ProductTabs from "@/Components/ProductTab";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();
  const { refetch } = useCartCount();

  const [product, setProduct] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, setError]);

  const variant = product?.variants?.[selectedVariantIndex];

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!variant || variant.stock === 0) return;

    try {
      setAdding(true);
      await API.post(
        "/api/cart/cart/add",
        {
          productId: product._id,
          quantity: 1,
          variant: {
            weight: variant.weight,
            price: variant.price,
            stock: variant.stock,
          },
        },
        { headers: getAuthHeader() },
      );
      refetch?.();
    } catch (err) {
      alert("Failed to add to cart", err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        Loading product…
      </div>
    );
  }

  if (!product || !variant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 text-red-500">
        Product not found
      </div>
    );
  }

  return (
    <div className="bg-orange-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8 grid md:grid-cols-2 gap-10">
        {/* ================= LEFT: IMAGE ================= */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-square border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
            <SafeImage
              src={product.image}
              alt={product.name}
              className="object-contain w-full h-full"
            />
          </div>

          {/* Thumbnails placeholder */}
          <div className="flex gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-16 border rounded-lg bg-gray-100"
              />
            ))}
          </div>
        </div>

        {/* ================= RIGHT: DETAILS ================= */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Category: {product.category}
          </p>

          {/* Rating placeholder */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-orange-500 font-semibold">★★★★☆</span>
            <span className="text-xs text-gray-500">(Customer rating)</span>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-center gap-3">
            <p className="text-3xl font-bold text-orange-600">
              ₹{variant.price}
            </p>
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-semibold">
              BEST PRICE
            </span>
          </div>

          {/* Stock */}
          <p className="mt-2 text-sm">
            {variant.stock > 0 ? (
              <span className="text-green-600">In stock</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>

          {/* Description */}
          <p className="mt-4 text-sm text-gray-700 leading-relaxed">
            {product.description || "No description available."}
          </p>

          {/* Variant Selector */}
          <div className="mt-6">
            <p className="text-sm font-semibold mb-2">Select Weight</p>
            <div className="flex gap-2 flex-wrap">
              {product.variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariantIndex(i)}
                  disabled={v.stock === 0}
                  className={`px-4 py-1.5 rounded-full border text-sm font-medium transition
                    ${
                      i === selectedVariantIndex
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-white text-gray-700"
                    }
                    ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}
                  `}
                >
                  {v.weight}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={variant.stock === 0 || adding}
              className={`flex-1 py-3 rounded-lg font-semibold transition
                ${
                  variant.stock > 0
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-300 text-gray-500"
                }
              `}
            >
              {adding ? "Adding…" : "Add to Cart"}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="flex-1 border border-orange-500 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-100 transition"
            >
              Go to Cart →
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 bg-white rounded-xl shadow-md">
        <ProductTabs product={product} />
      </div>

      {/* ================= MOBILE STICKY BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md p-4 flex gap-3 sm:hidden">
        <button
          onClick={handleAddToCart}
          disabled={variant.stock === 0 || adding}
          className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold"
        >
          {adding ? "Adding…" : "Add to Cart"}
        </button>
        <button
          onClick={() => navigate("/cart")}
          className="flex-1 border border-orange-500 text-orange-600 py-3 rounded-lg font-semibold"
        >
          Cart →
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
