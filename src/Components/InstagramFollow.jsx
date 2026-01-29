import { Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import API from "@/api";

const IG_HANDLE = "swadbest";
const IG_URL = `https://www.instagram.com/${IG_HANDLE}`;

const InstagramFollow = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/instagram/feed")
      .then((res) => setPosts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
      <div className="max-w-6xl mx-auto px-5">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-2 text-white/90">
            <Instagram />
            <span className="font-semibold">@{IG_HANDLE}</span>
          </div>

          <h2 className="text-4xl font-extrabold mt-3">
            Follow us on Instagram
          </h2>

          <p className="text-white/80 mt-3 max-w-xl mx-auto">
            Real customer stories, Ayurvedic tips & daily inspiration
          </p>
        </div>

        {/* GRID */}
        {loading ? (
          <p className="text-center text-white/70">Loading Instagram feed…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden"
              >
                <img
                  src={post.media_url}
                  alt="Instagram post"
                  className="aspect-square w-full object-cover group-hover:scale-110 transition duration-500"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-orange-600 px-10 py-4 rounded-full font-bold hover:scale-105 transition"
          >
            <Instagram />
            Follow @{IG_HANDLE}
          </a>
        </div>

      </div>
    </section>
  );
};

export default InstagramFollow;
