import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get(
          "api/products?featured=true"
        );
        setFeatured(res.data || []);
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-orange-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-[url('src/assets/homebackgroud.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Taste the Tradition with <span className="text-orange-400">SwadBest</span>
          </h1>
          <p className="text-gray-200 mb-6 text-lg">
            Pure. Authentic. Homemade Flavours — from our kitchen to your home.
          </p>
          <Link
            to="/products"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 md:px-12 bg-white">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-8">
          Explore Our Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { name: "Masala", image: "/images/masala.jpg" },
            { name: "Snacks", image: "/images/snacks.jpg" },
            { name: "Pickles", image: "/images/pickle.jpg" },
            { name: "Instant Mixes", image: "/images/mix.jpg" },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name.toLowerCase()}`}
              className="group relative overflow-hidden rounded-xl shadow hover:shadow-lg transition"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-40 object-cover transform group-hover:scale-110 transition duration-300"
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

      {/* Featured Products */}
      <section className="py-12 px-4 md:px-12">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-8">
          Featured Products
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading products...</p>
        ) : featured.length === 0 ? (
          <p className="text-center text-gray-600">
            No featured products available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {featured.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition border border-orange-100"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-48 w-full object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                  <p className="text-orange-600 font-bold mt-2">₹{item.price}</p>
                  <Link
                    to={`/products/${item._id}`}
                    className="mt-3 inline-block bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About / Brand Section */}
      <section className="bg-orange-100 py-12 px-6 text-center">
        <h2 className="text-2xl font-bold text-orange-700 mb-3">
          Why Choose SwadBest?
        </h2>
        <p className="max-w-3xl mx-auto text-gray-700 text-lg">
          SwadBest brings you the authentic homemade taste you’ve always loved.  
          Every product is crafted with pure ingredients, no harmful preservatives,  
          and packed with care — because your health deserves the best flavor.
        </p>
      </section>

      {/* CTA Footer */}
      <section className="py-12 bg-orange-500 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Order Once, Love Forever</h2>
        <p className="mb-6">Experience the real taste of India’s best homemade masalas & snacks.</p>
        <Link
          to="/products"
          className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-lg hover:bg-orange-100 transition"
        >
          Start Shopping
        </Link>
      </section>
    </div>
  );
};

export default Home;
