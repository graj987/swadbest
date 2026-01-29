import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "@/api";
import { getCachedLatestBlogs, setCachedLatestBlogs } from "@/cache/BlogCache";

const LatestBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedLatestBlogs();
    if (cached) {
      setBlogs(cached);
      setLoading(false);
      return;
    }

    API
      .get("/api/blogs/latest")
      .then((res) => {
        setBlogs(res.data);
        setCachedLatestBlogs(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!blogs.length) return null;

  const featured = blogs[0];
  const rest = blogs.slice(1);


  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              📰 Latest News & Blogs
            </h2>
            <p className="text-gray-600 mt-1">
              Learn more about Ayurveda, digestion & healthy living
            </p>
          </div>

          <Link
            to="/blogs"
            className="text-orange-600 font-semibold text-sm hover:underline"
          >
            View all →
          </Link>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* FEATURED BLOG */}
          <Link
            to={`/blogs/${featured.slug}`}
            className="lg:col-span-2 group bg-orange-50 rounded-2xl overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-64 object-cover group-hover:scale-105 transition"
            />

            <div className="p-6">
              <p className="text-xs text-gray-500">
                {new Date(featured.createdAt).toDateString()} •{" "}
                {featured.readTime}
              </p>

              <h3 className="text-2xl font-bold mt-2 text-gray-900">
                {featured.title}
              </h3>

              <p className="text-gray-700 mt-2 line-clamp-2">
                {featured.excerpt}
              </p>

              <span className="inline-block mt-4 text-orange-600 font-semibold">
                Read Article →
              </span>
            </div>
          </Link>

          {/* SIDE BLOGS */}
          <div className="space-y-6">
            {rest.map((blog) => (
              <Link
                key={blog._id}
                to={`/blogs/${blog.slug}`}
                className="flex gap-4 group"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-24 h-24 rounded-xl object-cover group-hover:scale-105 transition"
                />

                <div>
                  <p className="text-xs text-gray-500">
                    {new Date(blog.createdAt).toDateString()} •{" "}
                    {blog.readTime}
                  </p>

                  <p className="font-semibold text-gray-900 line-clamp-2">
                    {blog.title}
                  </p>

                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {blog.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestBlogs;
