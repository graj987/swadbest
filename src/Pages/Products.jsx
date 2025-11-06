import React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ProductCard from "../Components/ProductCard";
import Loader from "../Components/Loader";

const Products = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  // Read category from URL query (e.g. ?category=Masala)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryQuery = params.get("category") || "";
    setCategory(categoryQuery);
  }, [location]);

  // Fetch all products once on load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://swadbackendserver.onrender.com/api/products");
        setProducts(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter when search or category changes
  useEffect(() => {
    let data = [...products];

    if (category) {
      data = data.filter(
        (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search.trim()) {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  }, [search, category, products]);

  return (
    <div className="bg-orange-50 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-orange-600 text-center mb-8">
          Our Products
        </h2>

        {/* Search + Category Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-orange-400 outline-none"
          >
            <option value="">All Categories</option>
            <option value="Masala">Masala</option>
            <option value="Snacks">Snacks</option>
            <option value="Pickles">Pickles</option>
            <option value="Instant Mixes">Instant Mixes</option>
          </select>
        </div>

        {/* Loader */}
        {loading && <Loader text="Fetching our fresh products..." />}

        {/* Error */}
        {error && !loading && (
          <div className="text-center text-red-500 font-medium">{error}</div>
        )}

        {/* No Products Found */}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-gray-600">
            No products found for your search or filter.
          </p>
        )}

        {/* Product Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
