const DEALS = [
  {
    id: "combo-2",
    title: "Daily Digestive Combo",
    subtitle: "Best for digestion & metabolism",
    products: [
      { name: "Achwani Masala", qty: "100g" },
      { name: "Herbal Churan", qty: "100g" },
    ],
    originalPrice: 699,
    dealPrice: 549,
    badge: "MOST POPULAR",
    image: "/images/combo-2.png",
  },
  {
    id: "combo-3",
    title: "Complete Ayurvedic Care",
    subtitle: "Energy • Digestion • Immunity",
    products: [
      { name: "Achwani Masala", qty: "100g" },
      { name: "Herbal Churan", qty: "100g" },
      { name: "Immunity Mix", qty: "100g" },
    ],
    originalPrice: 999,
    dealPrice: 749,
    badge: "BEST VALUE",
    image: "/images/combo-3.png",
  },
];


import { useNavigate } from "react-router-dom";

const DealsOfTheDay = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-orange-50 py-14 px-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            🔥 Deals of the Day
          </h2>
          <p className="text-gray-600 mt-2">
            Special Ayurvedic combos curated for your daily health
          </p>
        </div>

        {/* DEAL CARDS */}
        <div className="grid md:grid-cols-2 gap-8">
          {DEALS.map((deal) => {
            const savings = deal.originalPrice - deal.dealPrice;

            return (
              <div
                key={deal.id}
                className="bg-white rounded-2xl shadow-lg border hover:shadow-xl transition overflow-hidden relative"
              >
                {/* BADGE */}
                <span className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {deal.badge}
                </span>

                <div className="grid md:grid-cols-2">
                  {/* IMAGE */}
                  <div className="bg-orange-100 flex items-center justify-center p-6">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-48 drop-shadow-xl"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900">
                      {deal.title}
                    </h3>

                    <p className="text-sm text-gray-600 mt-1">
                      {deal.subtitle}
                    </p>

                    {/* PRODUCT LIST */}
                    <ul className="mt-4 space-y-2 text-sm">
                      {deal.products.map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-green-600">✔</span>
                          {p.name} ({p.qty})
                        </li>
                      ))}
                    </ul>

                    {/* PRICE */}
                    <div className="mt-5">
                      <p className="text-sm text-gray-500 line-through">
                        ₹{deal.originalPrice}
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{deal.dealPrice}
                      </p>
                      <p className="text-xs text-green-600 font-semibold">
                        You save ₹{savings}
                      </p>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() =>
                        navigate(`/products?deal=${deal.id}`)
                      }
                      className="mt-6 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition"
                    >
                      Shop This Combo →
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
