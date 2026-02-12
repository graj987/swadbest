import { Instagram } from "lucide-react";

const IG_HANDLE = "swadbest";
const IG_URL = `https://www.instagram.com/${IG_HANDLE}`;

const InstagramFollow = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">

        {/* ICON + HANDLE */}
        <div className="flex justify-center items-center gap-2 text-white/90">
          <Instagram className="w-6 h-6" />
          <span className="font-semibold text-lg">@{IG_HANDLE}</span>
        </div>

        {/* HEADLINE */}
        <h2 className="text-3xl md:text-4xl font-extrabold mt-4">
          Follow us on Instagram
        </h2>

        {/* SUBTEXT */}
        <p className="text-white/85 mt-4 max-w-xl mx-auto text-sm md:text-base">
          Real customer stories, Ayurvedic tips & daily inspiration.
          Join our growing community.
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
              px-10 py-4
              rounded-full
              font-bold
              text-lg
              shadow-xl
              hover:scale-105
              active:scale-95
              transition
            "
          >
            <Instagram className="w-6 h-6" />
            Follow @{IG_HANDLE}
          </a>
        </div>

      </div>
    </section>
  );
};

export default InstagramFollow;
