import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api";
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

  /* Read category from URL */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCategory(params.get("category") || "");
  }, [location]);

  /* Fetch products */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/api/products");
        setProducts(res.data);
        setFiltered(res.data);
      } catch {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /* Filtering */
  useEffect(() => {
    let data = [...products];

    if (category) {
      data = data.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
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
    <main className="bg-white text-gray-800">

      {/* HEADER */}
      <section className="bg-orange-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-5 py-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-600">
            Our Products
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Explore our range of pure, homemade, and hygienically prepared
            food products.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-5 py-12">

        {/* FILTER BAR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full md:w-1/3
              rounded-lg border border-gray-300
              px-4 py-2
              focus:ring-2 focus:ring-orange-400 outline-none
            "
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="
              w-full md:w-1/4
              rounded-lg border border-gray-300
              px-4 py-2
              focus:ring-2 focus:ring-orange-400 outline-none
            "
          >
            <option value="">All Categories</option>
            <option value="Masala">Masala</option>
            <option value="Snacks">Snacks</option>
            <option value="Pickles">Pickles</option>
            <option value="Instant Mixes">Instant Mixes</option>
          </select>

          {/* RESULT COUNT */}
          {!loading && !error && (
            <p className="text-sm text-gray-500 md:text-right">
              Showing <span className="font-semibold">{filtered.length}</span>{" "}
              products
            </p>
          )}
        </div>

        {/* LOADER */}
        {loading && (
          <Loader text="Loading fresh products..." />
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="text-center text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-gray-700">
              No products found
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter.
            </p>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </section>
    </main>
  );
};

export default Products;
