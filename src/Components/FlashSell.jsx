import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";

const FlashSale = () => {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/offers/active").then((res) => {
      const flash = res.data.data.filter(o => o.type === "flash");
      setOffers(flash);
    });
  }, []);

  if (!offers.length) return null;

  return (
    <section className="bg-red-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-red-600 mb-6">
          ⚡ Flash Sale
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {offers.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <img
                src={o.image}
                alt={o.title}
                className="h-48 w-full object-cover"
              />

              <div className="p-4">
                <h3 className="font-bold text-lg">{o.title}</h3>
                <p className="text-sm text-gray-600">{o.subtitle}</p>

                <p className="mt-2 font-semibold text-red-600">
                  {o.discountType === "percentage"
                    ? `${o.discountValue}% OFF`
                    : `₹${o.discountValue} OFF`}
                </p>

                <button
                  onClick={() => navigate(`/product/${o.product._id}`)}
                  className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg font-semibold"
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

export default FlashSale;
