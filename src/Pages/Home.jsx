// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/Components/SafeImage";
import API from "@/api";


const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get("/api/products?featured=true");
        setFeatured(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* ================= TOP HERO ================= */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 items-center">

          {/* Left Content */}
          <div className="space-y-5">
            <span className="text-orange-500 font-semibold text-sm">
              #SwadBest Special
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Limited Time Offer!
              <span className="block text-orange-500">
                Authentic Homemade Taste
              </span>
            </h1>

            <p className="text-gray-600 text-lg">
              Freshly prepared masala, pickles & snacks made with love.
            </p>
          </div>

          {/* Right Product Visual */}
          <div className="relative flex justify-center">
            <SafeImage
              src="/images/pickle.jpg"
              alt="Featured product"
              className="w-[90%] max-w-md rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>
      {/* ================= CATEGORY STRIP ================= */}
      <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto justify-between">
          {[
            { name: "Masala", img: "/images/masala.jpg" },
            { name: "Snacks", img: "/images/snacks.jpg" },
            { name: "Pickles", img: "/images/pickle.jpg" },
            { name: "Instant Mix", img: "/images/mix.jpg" },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name.toLowerCase()}`}
              className="flex flex-col items-center gap-2 min-w-[80px]"
            >
              <div className="h-16 w-16 rounded-full bg-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                <SafeImage
                  src={cat.img}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>



      {/* ================= FEATURED ================= */}
      <section className="py-10 px-4 bg-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-orange-600 font-semibold hover:underline"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : featured.length === 0 ? (
            <p className="text-center text-gray-500">
              No featured products available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((item) => (
                <div
                  key={item._id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    className="h-40 w-full object-cover rounded-t-2xl"
                  />


                  <div className="p-3 space-y-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.category}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-orange-600 font-bold">
                        ₹{item.price}
                      </span>
                      <Link
                        to={`/products/${item._id}`}
                        className="text-sm font-semibold text-orange-600 hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= BRAND SLIDER ================= */}
      <section className="py-14 bg-orange-100">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-orange-700">
              The SwadBest Promise
            </h2>
            <p className="text-gray-700 text-lg">
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

          {/* Image slider feel */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <SafeImage
              src="/images/pickle.jpg"
              alt="Brand showcase"
              className="h-72 w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="py-14 px-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
          Shop by Category
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Masala", image: "/images/masala.jpg" },
            { name: "Snacks", image: "/images/snacks.jpg" },
            { name: "Pickles", image: "/images/pickle.jpg" },
            { name: "Instant Mixes", image: "/images/mix.jpg" },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name.toLowerCase()}`}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <SafeImage
                src={cat.image}
                alt={cat.name}
                className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-lg font-semibold">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
    <section className="relative overflow-hidden py-20 text-white">
  {/* Background */}
  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500" />
  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)]" />

  {/* Content */}
  <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
      Ready to Taste <span className="text-yellow-200">Real India?</span>
    </h2>

    <p className="text-lg md:text-xl text-orange-100 mb-8">
      Handcrafted flavors • Traditional recipes • Delivered fresh to your home
    </p>

    <Link
      to="/products"
      className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-transform duration-300"
    >
      Start Shopping
      <span className="text-xl">→</span>
    </Link>
  </div>
</section>

    </div>
  );
};

export default Home;
