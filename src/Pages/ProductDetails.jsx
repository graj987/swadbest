import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import SafeImage from "../Components/SafeImage";
import useAuth from "../Hooks/useAuth";
import useCartCount from "../Hooks/useCartCount";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();
  const { refetch } = useCartCount();

  const [product, setProduct] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const variant = product?.variants?.[selectedVariantIndex];

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!variant || variant.stock === 0) {
      alert("Please select an available variant");
      return;
    }

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
        { headers: getAuthHeader() }
      );

      refetch?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-orange-50">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !product || !variant) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-orange-50">
        <p className="text-red-500">{error || "Product not found."}</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border mt-8 grid md:grid-cols-2 gap-8">

        {/* IMAGE */}
        <div className="flex flex-col items-center gap-4">
          <div className="overflow-hidden rounded-xl shadow-md">
            <SafeImage
              src={product.image}
              alt={product.name}
              className="rounded-xl w-full max-w-sm object-cover"
            />
          </div>
        </div>

        {/* DETAILS */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {product.name}
          </h1>

          <p className="text-xs text-gray-500 mb-3">
            {product.category}
          </p>

          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {product.description || "No description available."}
          </p>

          {/* VARIANT SELECTOR */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Select Weight</p>
            <div className="flex gap-2 flex-wrap">
              {product.variants.map((v, i) => (
                <button
                  key={i}
                  disabled={v.stock === 0}
                  onClick={() => setSelectedVariantIndex(i)}
                  className={`
                    px-3 py-1 rounded-full border text-sm transition
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

          {/* PRICE */}
          <div className="flex items-center gap-3 mb-3">
            <p className="text-3xl font-extrabold text-orange-600">
              ₹{variant.price}
            </p>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-lg font-semibold">
              BEST PRICE
            </span>
          </div>

          {/* STOCK */}
          <div className="text-sm mb-5">
            {variant.stock > 0 ? (
              <span className="text-green-600">
                In stock ({variant.stock})
              </span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={variant.stock === 0 || adding}
              className={`
                flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition
                ${
                  variant.stock > 0
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {adding ? "Adding..." : "Add to Cart"}
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

      {/* MOBILE STICKY BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex sm:hidden gap-3">
        <button
          onClick={handleAddToCart}
          disabled={variant.stock === 0 || adding}
          className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold text-sm"
        >
          {adding ? "Adding..." : "Add to Cart"}
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
