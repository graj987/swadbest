import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";
import ProductCard from "../Components/ProductCard";
import { Search, SlidersHorizontal, X, ChevronDown, Package } from "lucide-react";

/* ─────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
      <div className="aspect-square bg-stone-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-stone-200 rounded-full w-1/3" />
        <div className="h-4 bg-stone-200 rounded-full w-3/4" />
        <div className="h-4 bg-stone-200 rounded-full w-1/2" />
        <div className="h-9 bg-stone-200 rounded-xl mt-3" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CATEGORIES  (extend as needed)
───────────────────────────────────────────── */
const CATEGORIES = ["All", "Masala", "Snacks", "Pickles", "Instant Mixes"];

const SORT_OPTIONS = [
  { label: "Featured",      value: "featured"    },
  { label: "Price: Low–High", value: "price_asc" },
  { label: "Price: High–Low", value: "price_desc"},
  { label: "Newest",        value: "newest"      },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Products = () => {
  const location = useLocation();


  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort]         = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false); // mobile drawer

  /* ── read URL param ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat);
  }, [location]);

  /* ── fetch ── */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/api/products");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /* ── filter + sort ── */
  const filtered = useMemo(() => {
    let data = [...products];

    if (category && category !== "All") {
      data = data.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (search.trim()) {
      data = data.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (sort === "price_asc")  data.sort((a, b) => (a.variants?.[0]?.price ?? 0) - (b.variants?.[0]?.price ?? 0));
    if (sort === "price_desc") data.sort((a, b) => (b.variants?.[0]?.price ?? 0) - (a.variants?.[0]?.price ?? 0));
    if (sort === "newest")     data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return data;
  }, [products, category, search, sort]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  const clearFilters = () => { setSearch(""); setCategory("All"); setSort("featured"); };
  const hasActiveFilter = search || category !== "All" || sort !== "featured";

  /* ─────────── RENDER ─────────── */
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">

      {/* ══════ HERO HEADER ══════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #431407 0%, #7c2d12 50%, #c2410c 100%)" }}
      >
        {/* noise */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
        {/* glow */}
        <div
          className="absolute -right-24 -top-24 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #fb923c 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/70 font-bold mb-3">
            Achwani · Homemade
          </p>
          <h1 className="text-[2.2rem] sm:text-5xl font-black text-white leading-tight">
            All Products
          </h1>
          <p className="mt-3 text-white/50 text-sm sm:text-base max-w-md leading-relaxed">
            Pure, handcrafted, and hygienically prepared — straight from our kitchen to yours.
          </p>

          {/* ── Inline search bar ── */}
          <div className="mt-8 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 max-w-lg shadow-xl">
            <Search className="w-4 h-4 text-white/50 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/50 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ══════ FILTER + SORT BAR ══════ */}
      <section className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Desktop */}
          <div className="hidden sm:flex items-center justify-between gap-4 py-3">
            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`
                    shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150
                    ${category === cat
                      ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                      : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Result count */}
              {!loading && !error && (
                <span className="text-xs text-stone-400 font-medium">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </span>
              )}

              {/* Clear */}
              {hasActiveFilter && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200 text-xs font-bold text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition-all"
                >
                  {activeSortLabel}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-stone-100 rounded-2xl shadow-xl py-1.5 z-50">
                    {SORT_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => { setSort(o.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors
                          ${sort === o.value ? "text-amber-700 bg-amber-50" : "text-stone-600 hover:bg-stone-50"}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex sm:hidden items-center justify-between gap-2 py-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 pr-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`
                    shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all
                    ${category === cat
                      ? "bg-amber-600 text-white"
                      : "text-stone-500 bg-stone-100"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOpen((o) => !o)}
              className="relative shrink-0 w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-600 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {sort !== "featured" && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>

          {/* Mobile sort drawer */}
          {sortOpen && (
            <div className="sm:hidden pb-3 border-t border-stone-100 pt-2 flex flex-wrap gap-2">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setSort(o.value); setSortOpen(false); }}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all
                    ${sort === o.value ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-600"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════ PRODUCT GRID ══════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-stone-700 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-amber-700 font-bold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center border border-stone-200">
              <Package className="w-6 h-6 text-stone-400" />
            </div>
            <div>
              <p className="text-stone-700 font-bold text-base">No products found</p>
              <p className="text-stone-400 text-sm mt-1">Try adjusting your filters or search term.</p>
            </div>
            <button
              onClick={clearFilters}
              className="text-sm font-bold text-amber-700 hover:text-amber-600 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {/* active filter pills */}
            {hasActiveFilter && (
              <div className="flex flex-wrap gap-2 mb-6">
                {category !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                    {category}
                    <button onClick={() => setCategory("All")}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200 text-stone-700 text-xs font-bold border border-stone-200">
                    "{search}"
                    <button onClick={() => setSearch("")}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {sort !== "featured" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200 text-stone-700 text-xs font-bold border border-stone-200">
                    {activeSortLabel}
                    <button onClick={() => setSort("featured")}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <span className="text-xs text-stone-400 self-center ml-1">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default Products;