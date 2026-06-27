// src/pages/Home.jsx
import React, {
  useEffect,
  useState,
  useRef,
  lazy,
  Suspense,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api";
import ProductCard from "@/Components/ProductCard";
import ProductCardSkeleton from "@/Components/ProductSkeleton";
import { Helmet } from "react-helmet-async";

/* ── Below-the-fold: each is its own chunk, mounted on scroll approach ── */
const DealsOfTheDay        = lazy(() => import("@/Components/DealsOfTheDay"));
const FlashSale            = lazy(() => import("@/Components/FlashSell"));
const LatestOffers         = lazy(() => import("@/Components/LatestOffer"));
const AchwaniBenefits      = lazy(() => import("@/Components/AchawaniBenifits"));
const AchwaniUsage         = lazy(() => import("@/Components/AchawaniUsage"));
const AyurvedaTestimonials = lazy(() => import("@/Components/AyurvedaTestimonials"));
const DigestiveComparison  = lazy(() => import("@/Components/DigestiveComparison"));
const LatestBlogs          = lazy(() => import("@/Components/LatestBlogs"));
const InstagramFollow      = lazy(() => import("@/Components/InstagramFollow"));

// Heavy 3D — its own chunk, desktop-only, mounted after the LCP image.
const Hero3D = lazy(() => import("@/Components/Hero3D"));


function LazySection({ className = "", minHeight = 480, children }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;

    if (!("IntersectionObserver" in window)) {
      setShow(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" } // start fetching the chunk before it's visible
    );

    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <section
      ref={ref}
      className={className}
      style={show ? undefined : { minHeight }}
    >
      {show ? (
        <Suspense fallback={<div style={{ minHeight }} />}>
          {children}
        </Suspense>
      ) : null}
    </section>
  );
}

/* ─────────────────────────── TRUST BADGE ─────────────────────────── */
function TrustBadge({ label }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700">
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
          <polyline points="2,6 5,9 10,3" />
        </svg>
      </span>
      {label}
    </div>
  );
}


function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : false
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const [hero, setHero] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroVisible, setHeroVisible] = useState(false);

  /* ── Fetch hero (price panel only — never blocks the LCP image) ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await API.get("/api/products/hero");
        if (!alive) return;
        setHero(res.data);
        setSelectedVariant(res.data?.variants?.[0] ?? null);
      } catch {
        if (alive) setHero(null);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ── Entrance animation for desktop-only decorative columns ── */
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── Fetch featured ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/api/products/featured");
        const list = res?.data?.data || res?.data || [];
        if (alive) setFeatured(Array.isArray(list) ? list : []);
      } catch {
        if (alive) setError("Failed to load featured products");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleBuy = (variant) => {
    const v = variant || selectedVariant;
    if (!hero?.id) return;
    navigate(`/products/${hero.id}`, {
      state: {
        heroMeta: {
          price: v?.price ?? hero.price,
          weight: v?.weight ?? hero.weight,
        },
      },
    });
  };

  const stock = selectedVariant?.stock ?? hero?.stock ?? 0;
  const price = selectedVariant?.price ?? hero?.price ?? 0;

  /* ─────────── RENDER ─────────── */
  return (
    <>
    <Helmet>
      <title>Swadbest | Authentic Handmade Indian Food</title>
      <meta name="description" content="Authentic handmade Indian Achwani and traditional homemade foods delivered fresh across India. No preservatives, FSSAI certified." />
      <meta name="keywords" content="handmade food, achwani, traditional Indian food, homemade snacks, Swadbest, ayurvedic food" />
      <meta property="og:title" content="Swadbest | Authentic Handmade Indian Food" />
      <meta property="og:description" content="Authentic handmade Indian Achwani and traditional foods. No preservatives, FSSAI certified." />
      <meta property="og:image" content="https://swadbest.com/img/heroJar.webp" />
      <meta property="og:url" content="https://swadbest.com" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Swadbest | Authentic Handmade Indian Food" />
      <meta name="twitter:description" content="Authentic handmade Indian Achwani and traditional foods. No preservatives, FSSAI certified." />
      <meta name="twitter:image" content="https://swadbest.com/img/heroJar.webp" />
      <link rel="canonical" href="https://swadbest.com" />
    </Helmet>
    <main className="bg-stone-50 text-stone-800 font-[system-ui]">

      {/* ══════════════════════ HERO ══════════════════════ */}
      {/* Always renders. Image + layout never depend on the hero API. */}
      <section className="relative min-h-screen overflow-hidden">

        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 70% at 50% 30%,
                #c2410c 0%,
                #9a3412 35%,
                #431407 70%,
                #1c0a03 100%
              )
            `,
          }}
        />

        {/* Radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-140 h-140 rounded-full opacity-20 blur-[30px]"
            style={{ background: "radial-gradient(circle, #fb923c 0%, transparent 70%)" }}
          />
        </div>

        {/* Bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

        {/* ── Content grid ── */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-0 px-6 md:px-16 min-h-screen">

          {/* LEFT — Brand copy (desktop only; not LCP) */}
          <div
            className={`hidden md:flex flex-col gap-5 transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
            style={{ transitionDelay: "100ms" }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80 font-medium">
              Traditional · Homemade · Premium
            </p>
            <h1 className="text-[clamp(2.4rem,4vw,3.5rem)] font-black leading-[1.05] text-white">
              Achwani<br />
              <span className="text-amber-300">Homemade</span><br />
              Spice
            </h1>
            <div className="w-12 h-0.5 bg-amber-500/60 rounded-full" />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Crafted in small batches using premium whole ingredients.
              No fillers, no shortcuts — just authentic, generational flavour.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {["No Preservatives", "Handcrafted", "FSSAI Certified"].map((t) => (
                <span
                  key={t}
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 text-white/70 border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* CENTER — LCP image. Paints immediately at full opacity. */}
          <div
            className="
              relative z-10 mx-auto
              w-75 h-75
              sm:w-95 sm:h-95
              md:w-125 md:h-125
              lg:w-150 lg:h-150
            "
          >
            <img
              src="/img/heroJar.webp"
              /* Generate these two variants (see notes); biggest mobile LCP win.
                 Until they exist, remove srcSet/sizes to avoid 404s. */
              srcSet="
                /img/heroJar-320.webp 320w,
                /img/heroJar-700.webp 700w,
                /img/heroJar.webp 1200w
              "
              sizes="
  (max-width: 640px) 320px,
  (max-width: 1024px) 700px,
  1200px
"
              alt="Swadbest Achwani — authentic handmade Indian spice jar"
              width="1200"
              height="1200"
              fetchpriority="high"
              loading="eager"
              decoding="async"
              className="w-full h-full object-contain select-none pointer-events-none"
            />

            {/* Desktop-only 3D — mounts after the LCP image, own chunk */}
            {isDesktop && (
              <Suspense fallback={null}>
                <Hero3D />
              </Suspense>
            )}
          </div>

          {/* RIGHT — Product panel (desktop only) */}
          <div
            className={`hidden md:flex flex-col gap-0 transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            style={{ transitionDelay: "200ms" }}
          >
            <div
              className="w-full max-w-65 ml-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div className="px-5 py-4 border-b border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Select size</p>
                <div className="flex flex-col gap-2 mt-3">
                  {hero?.variants?.map((variant, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(variant)}
                      className={`
                        w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left
                        ${selectedVariant?.weight === variant.weight
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                          : "bg-white/10 text-white/70 hover:bg-white/20"}
                      `}
                    >
                      <span className="flex items-center justify-between">
                        {variant.weight}
                        <span className="font-bold text-base">₹{variant.price}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Price</p>
                    <p className="text-2xl font-black text-white">₹{price}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      stock > 0
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <button
                  disabled={stock === 0}
                  onClick={() => handleBuy(selectedVariant)}
                  className={`
                    w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                    ${stock === 0
                      ? "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40 active:scale-[0.98]"}
                  `}
                >
                  {stock === 0 ? "Out of Stock" : "Buy Now"}
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE — bottom card */}
          <div className="md:hidden w-full pb-10 -mt-4">
            <div
              className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div className="p-4 flex gap-2 border-b border-white/10">
                {hero?.variants?.map((variant, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(variant)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all
                      ${selectedVariant?.weight === variant.weight
                        ? "bg-amber-500 text-white"
                        : "bg-white/10 text-white/60"}
                    `}
                  >
                    {variant.weight}<br />
                    <span className="font-bold">₹{variant.price}</span>
                  </button>
                ))}
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Total</p>
                  <p className="text-xl font-black text-white">₹{price}</p>
                </div>
                <button
                  disabled={stock === 0}
                  onClick={() => handleBuy(selectedVariant)}
                  className={`
                    flex-1 py-3 rounded-xl text-sm font-bold transition-all
                    ${stock === 0
                      ? "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-400 text-white active:scale-95"}
                  `}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════ TRUST STRIP ══════════════════════ */}
      <section className="bg-white border-y border-stone-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          <TrustBadge label="Hygienically Prepared" />
          <div className="hidden sm:block w-px h-4 bg-stone-200" />
          <TrustBadge label="No Preservatives" />
          <div className="hidden sm:block w-px h-4 bg-stone-200" />
          <TrustBadge label="FSSAI Certified" />
          <div className="hidden sm:block w-px h-4 bg-stone-200" />
          <TrustBadge label="Made in India" />
        </div>
      </section>

      {/* ══════════════════════ FEATURED PRODUCTS ══════════════════════ */}
      <section className="py-20 px-5 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold mb-2">Our Selection</p>
              <h2 className="text-3xl font-black tracking-tight text-stone-900">Featured Products</h2>
              <p className="text-stone-400 mt-1.5 text-sm">Our most loved and trusted picks</p>
            </div>
            <Link
              to="/products"
              className="group flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-600 transition-colors"
            >
              View All
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          )}
          {error && <p className="text-center text-red-500 py-8">{error}</p>}
          {!loading && !error && featured.length === 0 && (
            <p className="text-center text-stone-400 py-8">No featured products available</p>
          )}
          {!loading && !error && featured.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════ BELOW-FOLD (scroll-mounted) ══════════════════════ */}
      <LazySection className="bg-amber-50 border-t border-amber-100 py-16"><DealsOfTheDay /></LazySection>
      <LazySection className="bg-white py-16"><FlashSale /></LazySection>
      <LazySection className="bg-stone-50 border-y border-stone-100 py-16"><LatestOffers /></LazySection>
      <LazySection className="bg-white py-16"><AchwaniBenefits /></LazySection>
      <LazySection className="bg-stone-50 py-16"><AchwaniUsage /></LazySection>
      <LazySection className="bg-white py-16"><AyurvedaTestimonials /></LazySection>
      <LazySection className="bg-stone-50 border-y border-stone-100 py-16"><DigestiveComparison /></LazySection>
      <LazySection className="bg-white py-16"><LatestBlogs /></LazySection>
      <LazySection className="bg-stone-50 border-t border-stone-100" minHeight={320}><InstagramFollow /></LazySection>

    </main>
    </>
  );
};

export default Home;