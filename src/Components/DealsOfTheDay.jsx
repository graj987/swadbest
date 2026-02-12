import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";

const DealsOfTheDay = () => {
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/api/products/deals");

      const list =
        res?.data?.data ||
        res?.data ||
        [];

      setDeals(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Deals fetch failed:", err);
      setError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  if (loading) {
    return (
      <section className="py-14 text-center text-gray-500">
        Loading deals...
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-14 text-center text-red-500">
        {error}
      </section>
    );
  }

  if (!deals.length) return null;

  return (
    <section className="bg-orange-50 py-14 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Deals of the Day
          </h2>
          <p className="text-gray-600 mt-2">
            Limited-time discounts you shouldn’t miss
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {deals.map((p) => {
            const variant = p?.variants?.[0] || {};
            const originalPrice = variant?.price ?? 0;
            const discount = p?.deal?.discountPercent ?? 0;

            const dealPrice =
              discount > 0
                ? Math.round(originalPrice * (1 - discount / 100))
                : originalPrice;

            const savings = originalPrice - dealPrice;

            const image =
              p?.image ||
              p?.images?.[0] ||
              "/placeholder.png";

            return (
              <div
                key={p._id}
                className="bg-white rounded-2xl shadow-lg border hover:shadow-xl transition overflow-hidden relative"
              >
                {discount > 0 && (
                  <span className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                )}

                <div className="grid md:grid-cols-2">
                  <div className="bg-orange-100 flex items-center justify-center p-6">
                    <img
                      src={image}
                      alt={p?.name}
                      className="w-48 drop-shadow-xl object-contain"
                    />
                  </div>

                  <div className="p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900">
                      {p?.name}
                    </h3>

                    {variant?.weight && (
                      <p className="text-sm text-gray-600 mt-1">
                        Variant: {variant.weight}
                      </p>
                    )}

                    <div className="mt-5">
                      {discount > 0 && (
                        <p className="text-sm text-gray-500 line-through">
                          ₹{originalPrice}
                        </p>
                      )}

                      <p className="text-2xl font-bold text-orange-600">
                        ₹{dealPrice}
                      </p>

                      {savings > 0 && (
                        <p className="text-xs text-green-600 font-semibold">
                          You save ₹{savings}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/product/${p._id}`)}
                      className="mt-6 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition"
                    >
                      Shop Now →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default DealsOfTheDay;
