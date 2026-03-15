import React from "react";
import { X, Check } from "lucide-react";

const WITHOUT = [
  "Heavy stomach after meals",
  "Gas & bloating",
  "Slow digestion",
  "Tiredness after eating",
];

const WITH = [
  "Light & comfortable stomach",
  "Better digestion",
  "Reduced gas & acidity",
  "Energetic feeling after meals",
];

const DigestiveComparison = () => (
  <section className="py-20 px-4 bg-stone-50">
    <div className="max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="text-center mb-12">
        <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-2">The difference</p>
        <h2 className="text-3xl font-black text-stone-900 tracking-tight">Feel the Difference After Meals</h2>
        <p className="text-stone-400 text-sm mt-2">See what changes when you add Achwani to your routine</p>
      </div>

      {/* ── Comparison cards ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* WITHOUT */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 bg-red-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-red-500" strokeWidth={2.5} />
              </div>
              <h3 className="font-black text-stone-800">Without Achwani</h3>
            </div>
          </div>
          <ul className="divide-y divide-stone-50 px-5 py-2">
            {WITHOUT.map((item) => (
              <li key={item} className="flex items-center gap-3 py-3">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <X className="w-3 h-3 text-red-500" strokeWidth={3} />
                </div>
                <span className="text-sm text-stone-500">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WITH */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 bg-emerald-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
              </div>
              <h3 className="font-black text-stone-800">With Achwani</h3>
            </div>
          </div>
          <ul className="divide-y divide-stone-50 px-5 py-2">
            {WITH.map((item) => (
              <li key={item} className="flex items-center gap-3 py-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                </div>
                <span className="text-sm text-stone-700 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── CTA strip ── */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-5 rounded-2xl bg-white border border-stone-100 shadow-sm">
        <div>
          <p className="text-sm font-black text-stone-900">Ready to feel the difference?</p>
          <p className="text-xs text-stone-400 mt-0.5">Join 12,000+ customers who trust Achwani daily</p>
        </div>
        <a href="/products"
          className="h-11 px-7 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20 shrink-0 active:scale-[0.98]">
          Shop Now
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  </section>
);

export default DigestiveComparison;