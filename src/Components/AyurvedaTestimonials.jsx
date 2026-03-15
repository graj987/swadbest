import React from "react";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name:   "Dr. R. Mishra",
    role:   "Ayurvedic Practitioner",
    rating: 5,
    text:   "Achwani is a traditional digestive blend. Ingredients like ajwain, ginger, turmeric and ghee help balance digestion, reduce gas and improve metabolism naturally when taken after meals.",
  },
  {
    name:   "Sita Devi",
    role:   "Homemaker · Bihar",
    rating: 5,
    text:   "We have been using Achwani after meals for years. It helps digestion and gives comfort, especially for women. This homemade version tastes pure and effective.",
  },
  {
    name:   "Amit Kumar",
    role:   "Fitness Enthusiast",
    rating: 5,
    text:   "I take Achwani after heavy meals. It prevents bloating and keeps my stomach light. Much better than tablets or chemicals.",
  },
];

const AyurvedaTestimonials = () => (
  <section className="py-16 px-4 bg-stone-50">
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-2">Testimonials</p>
        <h2 className="text-3xl font-black text-stone-900 tracking-tight">Trusted by Tradition</h2>
        <p className="text-stone-400 text-sm mt-1.5 max-w-md mx-auto">
          Generations of families have relied on Achwani for natural digestive wellness
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <div key={i}
            className="relative bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
          >
            {/* Quote icon */}
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4 shrink-0">
              <Quote className="w-4 h-4 text-orange-500" strokeWidth={2} />
            </div>

            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {Array.from({length: t.rating}).map((_, s) => (
                <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>

            {/* Text */}
            <p className="text-sm text-stone-600 leading-relaxed flex-1">"{t.text}"</p>

            {/* Author */}
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                style={{ background:"linear-gradient(135deg,#431407,#c2410c)" }}
              >
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-stone-800">{t.name}</p>
                <p className="text-[11px] text-stone-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom stat */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-8 py-6 border-t border-stone-200">
        {[
          { value:"4.9/5",  label:"Average Rating"  },
          { value:"12K+",   label:"Happy Customers" },
          { value:"100%",   label:"Natural Ingredients" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-black text-stone-900">{value}</p>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AyurvedaTestimonials;