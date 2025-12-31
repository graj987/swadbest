// src/pages/Home.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/Components/SafeImage";
import API from "@/api";
import Loader from "@/Components/Loader";
import ProductCard from "@/Components/ProductCard";

const Home = () => {

  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await API.get("/api/products");

      // Featured filter
      const topProducts = res.data.filter((p) => p.featured === true);

      setFeatured(topProducts.length > 0 ? topProducts : res.data.slice(0, 8));

    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }
    , []);


  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">

      {/* ================= TOP HERO ================= */}
      <section className="border-b bg-cover bg-center " style={{ backgroundImage: "url('img/coverimg.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="space-y-4 md:space-y-6">
            <span className="text-orange-500 font-semibold text-sm md:text-base tracking-wide">
              #SwadBest Special
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Limited Time Offer!
              <span className="block text-orange-500">
                Authentic Homemade Taste
              </span>
            </h1>

            <p className="text-gray-200 text-base md:text-lg">
              Freshly prepared masala, pickles & snacks made with love.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY STRIP ================= */}
      {/* <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex gap-5 overflow-x-auto scrollbar-hide">
          {[
            { name: "Masala", img: "/images/masala.jpg" },
            { name: "Snacks", img: "/images/snacks.jpg" },
            { name: "Pickles", img: "/images/pickle.jpg" },
            { name: "Instant Mix", img: "/images/mix.jpg" },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name.toLowerCase()}`}
              className="flex flex-col items-center gap-2 min-w-[70px] md:min-w-[80px] transition-transform hover:scale-105"
            >
              <div className="h-16 w-16 rounded-full bg-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                <SafeImage
                  src={cat.img}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section> */}

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="py-10 px-4 bg-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Featured Products
            </h2>

            <Link to="/products" className="text-orange-600 font-semibold hover:underline">
              View All →
            </Link>
          </div>

          {loading && <Loader text="Fetching our fresh products..." />}

          {error && !loading && (
            <div className="text-center text-red-500 font-medium">{error}</div>
          )}

          {!loading && !error && featured.length === 0 && (
            <p className="text-center text-gray-600">No products found.</p>
          )}

          {/* GRID LIKE AMAZON / MEESHO (3 products per row on mobile) */}
          {!loading && !error && featured.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= BRAND PROMISE ================= */}
      <section className="py-14 bg-orange-100">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-orange-700 leading-snug">
              The SwadBest Promise
            </h2>

            <p className="text-gray-700 text-base md:text-lg">
              Every product is handcrafted using time-tested recipes,
              premium ingredients, and absolute hygiene.
            </p>

            <Link
              to="/products"
              className="inline-block mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Explore Products
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-xl h-72">
            <video
              src="video/product.mp4"
              autoPlay
              loop
              muted
              className="absolute inset-0 w-full h-full object-fit"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      {/* <section className="py-14 px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-10">
          Shop by Category
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Masala", image: "/images/masala.jpg" },
            { name: "Snacks", image: "/images/snacks.jpg" },
            { name: "Instant Mixes", image: "/images/mix.jpg" },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name.toLowerCase()}`}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <SafeImage
                src={cat.image}
                alt={cat.name}
                className="h-44 w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-lg font-semibold tracking-wide">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section> */}

      {/* ================= CTA ================= */}
      <section className="relative py-24 md:py-32 text-white overflow-hidden">

        {/* Background Image */}
        <img
          src="/images/cta.jpg"
          alt="SwadBest CTA"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 via-orange-700/70 to-black/60"></div>

        {/* Soft Glow Center Light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_70%)]"></div>

        {/* Decorative Shine */}
        <div className="absolute top-0 left-1/2 w-[80%] h-[120px] bg-white/20 blur-3xl rounded-full opacity-20 -translate-x-1/2"></div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
            Ready to Taste <span className="text-yellow-300">Real India?</span>
          </h2>

          <p className="text-base md:text-xl text-orange-100 mt-6 mb-10 max-w-2xl mx-auto drop-shadow-md">
            Handcrafted flavors • Traditional recipes • Delivered fresh to your home
          </p>

          <Link
            to="/products"
            className="inline-flex items-center gap-3 bg-white text-orange-700 font-semibold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            Start Shopping <span className="text-2xl">→</span>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
