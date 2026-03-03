import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";

const LatestOffers = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/products/latest")
      .then((res) => {
        setProducts(res.data.data || []);
      })
      .catch((err) => {
        console.error(
          "Latest products error:",
          err.response?.data || err.message,
        );
      });
  }, []);

  if (!products.length) return null;

  return (
    <section className="bg-white py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-orange-600 mb-8">
          Latest Arrivals
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {products.map((p) => {
            const firstVariant = p.variants?.[0];

            return (
              <div
                key={p._id}
                className="border rounded-xl overflow-hidden hover:shadow-md transition"
              >
                <img
                  src={p.image || p.images?.[0]}
                  alt={p.name}
                  className="h-36 w-full object-cover"
                />

                <div className="p-4">
                  <p className="font-semibold">{p.name}</p>

                  <p className="text-xs text-gray-500">
                    {firstVariant?.weight || ""}
                  </p>

                  <p className="text-sm font-bold text-orange-600 mt-1">
                    ₹{firstVariant?.price || 0}
                  </p>

                  <button
                    onClick={() => navigate(`/product/${p._id}`)}
                    className="mt-3 text-sm text-orange-600 font-semibold"
                  >
                    Shop Now →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LatestOffers;
