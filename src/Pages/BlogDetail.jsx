import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "@/api";

const BlogDetails = () => {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([
      API.get(`/api/blogs/${slug}`),
      API.get("/api/blogs/latest"),
    ])
      .then(([blogRes, latestRes]) => {
        setBlog(blogRes.data);
        setLatest(
          Array.isArray(latestRes.data)
            ? latestRes.data.filter(b => b.slug !== slug)
            : []
        );
      })
      .catch(() => setError("Blog not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center text-gray-500">
        Loading article…
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center text-red-600">
        Blog not found.
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <article className="bg-white">
      {/* HERO IMAGE (NO CROP, FULL IMAGE) */}
      {blog.image && (
        <div className="w-full bg-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-white">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* META */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
          <span>{new Date(blog.createdAt).toDateString()}</span>
          <span>•</span>
          <span>{blog.readTime}</span>
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
          {blog.title}
        </h1>

        {/* EXCERPT */}
        <p className="text-xl text-gray-700 mb-10 leading-relaxed">
          {blog.excerpt}
        </p>

        {/* BODY (HTML SAFE RENDER) */}
        <div
          className="
            prose prose-lg max-w-none
            prose-headings:font-semibold
            prose-headings:text-gray-900
            prose-p:text-gray-700
            prose-ul:list-disc
            prose-ol:list-decimal
          "
          dangerouslySetInnerHTML={{
            __html: typeof blog.content === "string" ? blog.content : "",
          }}
        />
      </div>

      {/* DIVIDER */}
      <div className="border-t my-12" />

      {/* MORE BLOGS */}
      {latest.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-6">
            More Articles
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.slice(0, 3).map(item => (
              <Link
                key={item._id}
                to={`/blogs/${item.slug}`}
                className="group border rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(item.createdAt).toDateString()} • {item.readTime}
                  </p>

                  <p className="font-semibold text-gray-900 line-clamp-2">
                    {item.title}
                  </p>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default BlogDetails;
