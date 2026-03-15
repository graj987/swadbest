import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";
import { Tag, ArrowRight, Loader2, Clock } from "lucide-react";

function DealSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="grid md:grid-cols-2">
        <div className="bg-stone-200 aspect-square md:aspect-auto md:h-56" />
        <div className="p-6 space-y-3">
          <div className="h-4 bg-stone-200 rounded-full w-1/2" />
          <div className="h-6 bg-stone-200 rounded-full w-3/4" />
          <div className="h-4 bg-stone-200 rounded-full w-1/3" />
          <div className="h-8 bg-stone-200 rounded-full w-1/2 mt-4" />
          <div className="h-11 bg-stone-200 rounded-xl w-full mt-6" />
        </div>
      </div>
    </div>
  );
}

const DealsOfTheDay = () => {
  const navigate = useNavigate();
  const [deals,   setDeals]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res  = await API.get("/api/products/deals");
        const list = res?.data?.data || res?.data || [];
        setDeals(Array.isArray(list) ? list.filter(Boolean) : []);
      } catch {
        setError("Failed to load deals");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-5">
        <DealSkeleton /><DealSkeleton />
      </div>
    </section>
  );

  if (error || !deals.length) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-1.5">Limited Time</p>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">Deals of the Day</h2>
            <p className="text-stone-400 text-sm mt-1">Discounts that disappear at midnight</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Ends tonight
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {deals.map((p) => {
            if (!p) return null;
            const variant       = p?.variants?.[0] || {};
            const originalPrice = variant?.price ?? 0;
            const discount      = p?.deal?.discountPercent ?? 0;
            const dealPrice     = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;
            const savings       = originalPrice - dealPrice;
            const image         = p?.image || p?.images?.[0] || "/placeholder.png";

            return (
              <div
                key={p._id}
                className="group bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="grid md:grid-cols-2">
                  {/* Image */}
                  <div className="relative bg-amber-50 border-r border-stone-100 flex items-center justify-center p-8 min-h-[200px]">
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-rose-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow">
                        <Tag className="w-3 h-3" />
                        {discount}% OFF
                      </div>
                    )}
                    <img
                      src={image}
                      alt={p?.name}
                      className="w-36 h-36 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col justify-between">
                    <div>
                      {variant?.weight && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full mb-2">
                          {variant.weight}
                        </span>
                      )}
                      <h3 className="text-lg font-black text-stone-900 leading-snug">{p?.name}</h3>

                      <div className="mt-4 space-y-0.5">
                        {discount > 0 && (
                          <p className="text-sm text-stone-400 line-through">₹{originalPrice}</p>
                        )}
                        <p className="text-2xl font-black text-stone-900">₹{dealPrice}</p>
                        {savings > 0 && (
                          <p className="text-xs font-bold text-emerald-600">
                            You save ₹{savings}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/products/${p._id}`)}
                      className="mt-5 w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-orange-600/20 active:scale-[0.98]"
                    >
                      Shop Now <ArrowRight className="w-4 h-4" />
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