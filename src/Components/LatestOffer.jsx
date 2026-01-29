import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";

const LatestOffers = () => {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/offers/active").then((res) => {
      const latest = res.data.data.filter(o => o.type === "latest");
      setOffers(latest);
    });
  }, []);

  if (!offers.length) return null;

  return (
    <section className="bg-white py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-orange-600 mb-8">
          🎁 Latest Offers
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {offers.map((o) => (
            <div
              key={o._id}
              className="border rounded-xl overflow-hidden hover:shadow-md transition"
            >
              <img
                src={o.image}
                alt={o.title}
                className="h-36 w-full object-cover"
              />

              <div className="p-4">
                <p className="font-semibold">{o.title}</p>
                <p className="text-xs text-gray-500">{o.subtitle}</p>

                <button
                  onClick={() => navigate(`/product/${o.product._id}`)}
                  className="mt-3 text-sm text-orange-600 font-semibold"
                >
                  Shop Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestOffers;
