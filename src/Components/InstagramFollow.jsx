import { Instagram, ArrowRight, Heart, Users } from "lucide-react";

const IG_HANDLE = "swadbest";
const IG_URL    = `https://www.instagram.com/${IG_HANDLE}`;

const STATS = [
  { value: "12K+", label: "Followers"  },
  { value: "4.9",  label: "Rating"     },
  { value: "500+", label: "Reviews"    },
];

const InstagramFollow = () => (
  <section className="relative py-24 overflow-hidden">
    {/* Background image */}
    <div className="absolute inset-0">
      <img src="/img/followimg.jpg" alt="Achwani lifestyle" className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background:"linear-gradient(135deg, rgba(67,20,7,0.88) 0%, rgba(194,65,12,0.75) 100%)" }} />
    </div>

    {/* Noise */}
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
      style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"180px" }} />

    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">

      {/* Handle pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-6">
        <Instagram className="w-4 h-4 text-white" strokeWidth={2} />
        <span className="text-sm font-bold tracking-wide">@{IG_HANDLE}</span>
      </div>

      {/* Headline */}
      <h2 className="text-4xl sm:text-5xl font-black leading-[1.05] mb-4">
        Join Our Wellness<br />Community
      </h2>

      <p className="text-white/65 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
        Real customer stories, Ayurvedic tips, and daily wellness inspiration — straight from our community.
      </p>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-8 mb-10">
        {STATS.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href={IG_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 h-14 px-10 rounded-2xl bg-white text-orange-700 font-black text-base shadow-2xl shadow-black/30 hover:bg-orange-50 hover:scale-105 active:scale-[0.98] transition-all duration-200"
      >
        <Instagram className="w-5 h-5" strokeWidth={2} />
        Follow @{IG_HANDLE}
        <ArrowRight className="w-4 h-4" />
      </a>

      <p className="text-white/40 text-xs mt-4 font-medium">Join 12,000+ followers who love SwadBest</p>
    </div>
  </section>
);

export default InstagramFollow;