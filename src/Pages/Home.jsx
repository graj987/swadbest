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

      {/* ================= HERO ================= */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('/img/coverimg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative max-w-7xl mx-auto px-5 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center text-white">
          <div className="space-y-6">
            <span className="inline-block text-sm font-semibold tracking-widest text-orange-300">
              PURE • HOMEMADE • TRUSTED
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Taste You Can <span className="text-orange-400">Trust</span>
            </h1>

            <p className="text-gray-200 text-lg max-w-md">
              Authentic homemade masala, pickles & snacks crafted
              with traditional recipes and uncompromising hygiene.
            </p>

            <div className="flex gap-4">
              <Link
                to="/products"
                className="bg-orange-600 hover:bg-orange-700 px-7 py-3 rounded-xl font-semibold transition"
              >
                Shop Now
              </Link>

              <Link
                to="/about"
                className="border border-white/40 px-7 py-3 rounded-xl hover:bg-white/10 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm">
          <TrustItem title="Hygienically Prepared" />
          <TrustItem title="No Preservatives" />
          <TrustItem title="FSSAI Certified" />
          <TrustItem title="Made in India 🇮🇳" />
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
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
