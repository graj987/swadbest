// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "@/api";
import Loader from "@/Components/Loader";
import ProductCard from "@/Components/ProductCard";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/api/products");
        const top = res.data.filter((p) => p.featured);
        setFeatured(top.length ? top : res.data.slice(0, 8));
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="bg-white text-gray-800">

      <section className="relative min-h-screen overflow-hidden">

        {/* GRADIENT BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-700 via-orange-600 to-red-700" />

        {/* SOFT LEAF / SHAPE PATTERN (OPTIONAL, VERY SUBTLE) */}
        <div className="absolute inset-0 opacity-[0.08] bg-[url('/img/pattern-leaf.svg')] bg-repeat bg-[length:320px]" />

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-6">

          {/* TOP BAR */}
          <div className="absolute top-6 left-0 right-0 max-w-7xl mx-auto px-6 flex justify-between text-xs text-white/70">
            <span>← Back</span>
            <span className="font-semibold">SwadBest</span>
          </div>

          {/* LEFT TEXT (FLOATING, NOT GRID) */}
          <div className="absolute left-6 md:left-20 top-1/2 -translate-y-1/2 max-w-sm hidden md:block">
            <h1 className="text-4xl font-bold leading-tight">
              Achwani <br />
              Homemade Spice
            </h1>
            <p className="text-white/80 mt-3 text-sm">
              Crafted in small batches using traditional recipes
              and premium ingredients.
            </p>
            <p className="mt-2 text-xs text-white/60">
              250 g
            </p>
          </div>

          {/* CENTER PRODUCT (THIS IS THE STAR) */}
          <div className="relative flex items-center justify-center">

            {/* AMBIENT GLOW */}
            <div className="absolute w-[520px] h-[520px] bg-white/20 blur-[120px] rounded-full"></div>

            {/* GROUND SHADOW */}
            <div className="absolute bottom-10 w-72 h-6 bg-black/40 blur-xl rounded-full"></div>

            {/* PRODUCT IMAGE */}
            <img
              src="/img/coverImgnew-removebg-preview.png"
              alt="SwadBest Achwani Spice"
              className="
          relative z-10
          h-[420px] md:h-[520px]
          object-contain
          drop-shadow-[0_35px_45px_rgba(0,0,0,0.35)]
        "
            />
          </div>

          {/* RIGHT OPTIONS (LIKE 30 / 60 / 90) */}
          <div className="absolute right-6 md:right-20 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3">
            {["50g", "100g", "250g"].map((v, i) => (
              <button
                key={i}
                className={`w-10 h-10 rounded-full text-xs font-semibold 
            ${v === "250g"
                    ? "bg-white text-orange-700"
                    : "border border-white/40 text-white/70 hover:bg-white/10"}
          `}
              >
                {v}
              </button>
            ))}
          </div>

          {/* BOTTOM CTA */}
          <div className="absolute bottom-10 right-6 md:right-20 flex items-center gap-4">
            <span className="text-xl font-bold">₹250</span>
            <button className="bg-white text-orange-700 px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition">
              Buy Now
            </button>
          </div>

        </div>
      </section>




      <section className="bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm">
          <TrustItem title="Hygienically Prepared" />
          <TrustItem title="No Preservatives" />
          <TrustItem title="FSSAI Certified" />
          <TrustItem title="Made in India 🇮🇳" />
        </div>
      </section>


      <section className="py-14 px-5">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-orange-600 font-medium hover:underline"
            >
              View All →
            </Link>
          </div>

          {loading && <Loader text="Loading fresh products..." />}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {!loading && featured.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= BRAND PROMISE ================= */}
      <section className="bg-orange-50 py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-orange-700">
              The SwadBest Promise
            </h2>
            <p className="text-gray-700 text-lg">
              Every product is made in small batches using time-tested
              recipes, premium ingredients, and strict hygiene standards.
            </p>

            <Link
              to="/products"
              className="inline-block mt-4 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition"
            >
              Explore Products
            </Link>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-lg h-72">
            <video
              src="/video/product.mp4"
              autoPlay
              loop
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-24 text-white text-center overflow-hidden">
        <img
          src="/images/cta.jpg"
          alt="SwadBest"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold">
            Ready for <span className="text-orange-400">Real Homemade Taste?</span>
          </h2>

          <p className="text-lg text-gray-200 mt-6 mb-10">
            Trusted by families who care about purity, taste, and health.
          </p>

          <Link
            to="/products"
            className="inline-flex items-center gap-3 bg-orange-600 px-10 py-4 rounded-full font-semibold hover:bg-orange-700 transition"
          >
            Start Shopping <span className="text-2xl">→</span>
          </Link>
        </div>
      </section>

    </main>
  );
};

export default Home;

/* -------- SMALL COMPONENT -------- */

function TrustItem({ title }) {
  return (
    <div className="font-medium text-gray-700">
      ✓ {title}
    </div>
  );
}
