import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";
import { ArrowRight, Sparkles } from "lucide-react";

function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="aspect-square bg-stone-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-stone-200 rounded-full w-1/3" />
        <div className="h-4 bg-stone-200 rounded-full w-2/3" />
        <div className="h-4 bg-stone-200 rounded-full w-1/2" />
        <div className="h-8 bg-stone-200 rounded-lg w-full mt-3" />
      </div>
    </div>
  );
}

const LatestOffer = () => {
  const navigate      = useNavigate();
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    API.get("/api/products/latest")
      .then((res) => setProducts(Array.isArray(res.data?.data) ? res.data.data.filter(Boolean) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !products.length) return null;

  return (
    <section className="py-16 px-4 bg-stone-50">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-1.5">Fresh in stock</p>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">Latest Arrivals</h2>
            <p className="text-stone-400 text-sm mt-1">Newest additions to our collection</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Just added
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({length:4}).map((_,i)=><CardSkeleton key={i}/>)
            : products.map((p) => {
                if (!p) return null;
                const v = p.variants?.[0];
                return (
                  <div key={p._id}
                    onClick={() => navigate(`/products/${p._id}`)}
                    className="group bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-stone-50 flex items-center justify-center overflow-hidden p-4">
                      <img
                        src={p.image || p.images?.[0] || "/placeholder.png"}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      {p.category && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-1">{p.category}</p>
                      )}
                      <p className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug">{p.name}</p>

                      <div className="flex items-center justify-between mt-2.5">
                        <div>
                          {v?.weight && <p className="text-[11px] text-stone-400">{v.weight}</p>}
                          <p className="text-base font-black text-stone-900">₹{v?.price ?? 0}</p>
                        </div>
                      </div>

                      <button
                        className="mt-3 w-full h-9 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-orange-600/20"
                      >
                        Shop Now <ArrowRight className="w-3.5 h-3.5" />
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

export default LatestOffer;