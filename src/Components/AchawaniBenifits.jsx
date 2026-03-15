import React from "react";
import { ShieldCheck, Leaf } from "lucide-react";

const BENEFITS = [
  { img:"/img/healty drink.avif",    title:"Boosts Metabolism",    desc:"Improves digestion and helps the body process food efficiently."            },
  { img:"/img/stomachhealth.avif",   title:"Aids Digestion",       desc:"Reduces bloating and improves gut comfort after meals."                    },
  { img:"/img/women wellness.webp",  title:"Pregnancy Friendly",   desc:"Traditionally used for women's wellness and balance."                      },
  { img:"/img/natural energy.webp",  title:"Natural Energy",       desc:"Keeps the body active without artificial additives."                       },
  { img:"/img/hearbalteacup.webp",   title:"Immunity Support",     desc:"Spices selected to strengthen natural immunity."                           },
  { img:"/img/spiesinbowl.webp",     title:"100% Homemade",        desc:"Prepared in small batches using traditional methods."                      },
];

const INGREDIENTS = [
  { name:"Ginger",       img:"/img/ginger.avif"           },
  { name:"Mishri",       img:"/img/suger candy.webp"       },
  { name:"Ghee",         img:"/img/Ghee.webp"             },
  { name:"Ajwain",       img:"/img/ajwain.webp"           },
  { name:"Turmeric",     img:"/img/turmuric.avif"         },
  { name:"Black Pepper", img:"/img/balck pepper.avif"     },
  { name:"Honey",        img:"/img/honey.avif"            },
];

const PURITY_PILLS = ["No Chemicals", "No Preservatives", "No Artificial Flavors"];

const AchwaniBenefits = () => (
  <section className="bg-stone-50 py-20 px-4">
    <div className="max-w-5xl mx-auto space-y-20">

      {/* ── Header ── */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-2">Why it works</p>
        <h2 className="text-4xl font-black text-stone-900 tracking-tight leading-tight">
          Why <span className="text-orange-600">Achwani</span> Works
        </h2>
        <p className="mt-4 text-stone-400 text-base leading-relaxed">
          A powerful traditional blend crafted with natural ingredients to support
          digestion, metabolism and everyday wellness.
        </p>
      </div>

      {/* ── Benefits grid ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {BENEFITS.map((b, i) => (
          <div key={i}
            className="group bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="relative h-44 overflow-hidden bg-stone-100">
              <img src={b.img} alt={b.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              {/* Number badge */}
              <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-orange-600 text-white text-[11px] font-black flex items-center justify-center shadow">
                {i + 1}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-base font-black text-stone-900">{b.title}</h3>
              <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Ingredients ── */}
      <div>
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-2">What's inside</p>
          <h3 className="text-2xl font-black text-stone-900">Pure & Natural Ingredients</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {INGREDIENTS.map((ing, i) => (
            <div key={i} className="group flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-stone-200 bg-white shadow-sm group-hover:border-orange-300 group-hover:shadow-md transition-all duration-200">
                <img src={ing.img} alt={ing.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-xs font-bold text-stone-600">{ing.name}</p>
            </div>
          ))}
        </div>

        {/* Purity pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-10">
          {PURITY_PILLS.map((p) => (
            <span key={p}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
              {p}
            </span>
          ))}
        </div>
      </div>

    </div>
  </section>
);

export default AchwaniBenefits;