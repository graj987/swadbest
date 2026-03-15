import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "@/api";
import { getCachedLatestBlogs, setCachedLatestBlogs } from "@/cache/BlogCache";
import { ArrowRight, BookOpen } from "lucide-react";

function BlogSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="lg:col-span-2 bg-stone-200 rounded-2xl h-80" />
    </div>
  );
}

const LatestBlogs = () => {
  const [blogs,   setBlogs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedLatestBlogs();
    if (cached) { setBlogs(cached); setLoading(false); return; }
    API.get("/api/blogs/latest")
      .then((res) => { const d = res.data; setBlogs(Array.isArray(d)?d:[]); setCachedLatestBlogs(Array.isArray(d)?d:[]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto animate-pulse space-y-4">
        <div className="h-6 w-48 bg-stone-200 rounded-full" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-stone-200 rounded-2xl" />
          <div className="space-y-4">
            {[1,2,3].map(i=><div key={i} className="h-20 bg-stone-200 rounded-xl"/>)}
          </div>
        </div>
      </div>
    </section>
  );

  if (!blogs.length) return null;

  const featured = blogs[0];
  const rest     = blogs.slice(1, 4);

  const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-1.5">From our kitchen</p>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">Latest Blogs</h2>
            <p className="text-stone-400 text-sm mt-1">Ayurveda, digestion & healthy living</p>
          </div>
          <Link to="/blogs"
            className="group hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors">
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Featured */}
          <Link to={`/blogs/${featured.slug}`}
            className="lg:col-span-2 group bg-stone-50 border border-stone-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="relative overflow-hidden h-56">
              <img src={featured.image} alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {featured.category && (
                <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white px-2.5 py-1 rounded-full">
                  {featured.category}
                </span>
              )}
            </div>
            <div className="p-5">
              <p className="text-[11px] text-stone-400 font-medium">
                {fmtDate(featured.createdAt)}{featured.readTime && ` · ${featured.readTime}`}
              </p>
              <h3 className="text-xl font-black text-stone-900 mt-1.5 leading-snug group-hover:text-orange-600 transition-colors">
                {featured.title}
              </h3>
              <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed">{featured.excerpt}</p>
              <div className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-orange-600">
                Read article <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>

          {/* Side list */}
          <div className="flex flex-col justify-between gap-4">
            {rest.map((blog) => (
              <Link key={blog._id} to={`/blogs/${blog.slug}`}
                className="group flex gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                  <img src={blog.image} alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-stone-400 font-medium">
                    {fmtDate(blog.createdAt)}{blog.readTime && ` · ${blog.readTime}`}
                  </p>
                  <p className="text-sm font-bold text-stone-800 line-clamp-2 mt-0.5 leading-snug group-hover:text-orange-600 transition-colors">
                    {blog.title}
                  </p>
                  <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{blog.excerpt}</p>
                </div>
              </Link>
            ))}

            <Link to="/blogs"
              className="flex items-center justify-center gap-2 h-10 rounded-xl border border-stone-200 text-sm font-bold text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all mt-1">
              <BookOpen className="w-4 h-4" /> All Articles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestBlogs;