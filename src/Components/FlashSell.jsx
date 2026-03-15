import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";
import { Zap, ArrowRight, Clock } from "lucide-react";

function FlashSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="h-44 bg-stone-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-5 bg-stone-200 rounded-full w-3/4" />
        <div className="h-3 bg-stone-200 rounded-full w-1/2" />
        <div className="h-4 bg-stone-200 rounded-full w-1/3" />
        <div className="h-10 bg-stone-200 rounded-xl w-full mt-3" />
      </div>
    </div>
  );
}

const FlashSell = () => {
  const navigate       = useNavigate();
  const [offers,   setOffers]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    API.get("/api/offers/active")
      .then((res) => {
        const all   = res.data?.data || res.data || [];
        const flash = Array.isArray(all) ? all.filter(Boolean).filter(o=>o.type==="flash") : [];
        setOffers(flash);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !offers.length) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-600 font-bold mb-1.5">Today only</p>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <Zap className="w-7 h-7 text-red-500 fill-red-500" />
              Flash Sale
            </h2>
            <p className="text-stone-400 text-sm mt-1">These offers won't last long</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Hurry — limited stock
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {loading
            ? Array.from({length:3}).map((_,i)=><FlashSkeleton key={i}/>)
            : offers.map((o) => {
                if (!o) return null;
                const discountLabel = o.discountType==="percentage" ? `${o.discountValue}% OFF` : `₹${o.discountValue} OFF`;
                return (
                  <div key={o._id}
                    className="group bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden bg-stone-50 h-44 flex items-center justify-center">
                      <img src={o.image} alt={o.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {/* Discount badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow">
                        <Zap className="w-3 h-3 fill-white" />
                        {discountLabel}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-black text-stone-900 leading-snug">{o.title}</h3>
                      {o.subtitle && <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{o.subtitle}</p>}

                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
                        <Zap className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
                        <span className="text-xs font-black text-red-600">{discountLabel}</span>
                      </div>

                      <button
                        onClick={() => o.product?._id && navigate(`/products/${o.product._id}`)}
                        className="mt-4 w-full h-10 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-red-500/20 active:scale-[0.98]"
                      >
                        Shop Now <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    </section>
  );
};

export default FlashSell;