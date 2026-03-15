import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";

const STEPS = [
  { img:"/img/mealpate.jpg",   title:"After Meals",          desc:"Consume Achwani immediately after lunch or dinner."            },
  { img:"/img/spoon.avif",     title:"Recommended Quantity", desc:"Take ½ to 1 teaspoon according to your preference."           },
  { img:"/img/waterglass.jpg", title:"Avoid Water",          desc:"Do not drink water immediately after consumption."             },
  { img:"/img/watch.jpg",      title:"Wait 30 Minutes",      desc:"Drink water only after 30 minutes for optimal results."       },
];

const AchwaniUsage = () => (
  <section className="bg-white py-20 px-4">
    <div className="max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-2">Step by step</p>
        <h2 className="text-4xl font-black text-stone-900 tracking-tight leading-tight">
          How to Use <span className="text-orange-600">Achwani</span>
        </h2>
        <p className="mt-4 text-stone-400 text-base leading-relaxed">
          Follow these four simple steps to get the best digestive benefits.
        </p>
      </div>

      {/* ── Steps ── */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 relative">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-0.5 bg-orange-100 z-0" />

        {STEPS.map((step, i) => (
          <div key={i}
            className="group relative bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 z-10">

            {/* Image */}
            <div className="relative h-36 overflow-hidden bg-stone-50">
              <img src={step.img} alt={step.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Step badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-600 text-white text-[11px] font-black flex items-center justify-center shadow-md border-2 border-white z-10">
              {i + 1}
            </div>

            {/* Content */}
            <div className="p-4 text-center">
              <h3 className="text-sm font-black text-stone-900 leading-snug">{step.title}</h3>
              <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">{step.desc}</p>
            </div>

            {/* Arrow connector (all except last) */}
            {i < STEPS.length - 1 && (
              <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 z-20 items-center justify-center bg-orange-100 border border-orange-200 rounded-full">
                <ArrowRight className="w-3 h-3 text-orange-500" strokeWidth={2.5} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Disclaimer ── */}
      <div className="mt-10 flex items-start gap-3 px-4 py-4 rounded-2xl bg-amber-50 border border-amber-200 max-w-2xl mx-auto">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-xs text-amber-800 leading-relaxed font-medium">
          For pregnant women, consume in moderate quantity as part of a balanced diet.
          Consult a healthcare professional if required.
        </p>
      </div>
    </div>
  </section>
);

export default AchwaniUsage;