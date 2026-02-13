import { Instagram } from "lucide-react";

const IG_HANDLE = "swadbest";
const IG_URL = `https://www.instagram.com/${IG_HANDLE}`;

const InstagramFollow = () => {
  return (
    <section className="relative py-28 overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/img/followimg.jpg"
          alt="Achwani lifestyle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-orange-600/60" />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 text-center text-white">

        {/* Floating Glass Card */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl">

          {/* Handle */}
          <div className="flex justify-center items-center gap-3 text-white/90">
            <Instagram className="w-7 h-7" />
            <span className="font-semibold text-xl tracking-wide">
              @{IG_HANDLE}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
            Join Our Wellness Community
          </h2>

          {/* Subtext */}
          <p className="mt-6 max-w-2xl mx-auto text-white/85 text-lg">
            Real customer experiences, Ayurvedic tips and daily wellness inspiration.
            Discover how Achwani becomes part of healthy routines.
          </p>

          {/* CTA */}
          <div className="mt-10">
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-3
                bg-white text-orange-600
                px-12 py-4
                rounded-full
                font-bold
                text-lg
                shadow-xl
                hover:scale-105
                transition duration-300
              "
            >
              <Instagram className="w-6 h-6" />
              Follow @{IG_HANDLE}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InstagramFollow;
