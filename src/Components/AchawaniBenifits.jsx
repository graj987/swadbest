import React from "react";

const BENEFITS = [
  {
    img: "/img/healty drink.avif",
    title: "Boosts Metabolism",
    desc: "Improves digestion and helps the body process food efficiently.",
  },
  {
    img: "/img/stomachhealth.avif",
    title: "Aids Digestion",
    desc: "Reduces bloating and improves gut comfort after meals.",
  },
  {
    img: "/img/women wellness.webp",
    title: "Pregnancy Friendly",
    desc: "Traditionally used for women's wellness and balance.",
  },
  {
    img: "/img/natural energy.webp",
    title: "Natural Energy",
    desc: "Keeps the body active without artificial additives.",
  },
  {
    img: "/img/hearbalteacup.webp",
    title: "Immunity Support",
    desc: "Spices selected to strengthen natural immunity.",
  },
  {
    img: "/img/spiesinbowl.webp",
    title: "100% Homemade",
    desc: "Prepared in small batches using traditional methods.",
  },
];

const INGREDIENTS = [
  { name: "Ginger", img: "/img/ginger.avif" },
  { name: "Mishri", img: "/img/suger candy.webp" },
  { name: "Ghee", img: "/img/Ghee.webp" },
  { name: "Ajwain", img: "/img/ajwain.webp" },
  { name: "Turmeric", img: "/img/turmuric.avif" },
  { name: "Black Pepper", img: "/img/balck pepper.avif" },
  { name: "Honey", img: "/img/honey.avif" },
];

const AchwaniBenefits = () => {
  return (
    <section className="bg-gradient-to-b from-orange-50 to-white py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-24">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Why <span className="text-orange-600">Achwani</span> Works
          </h2>
          <p className="mt-5 text-gray-600 text-lg leading-relaxed">
            A powerful traditional blend crafted with natural ingredients
            to support digestion, metabolism and everyday wellness.
          </p>
        </div>

        {/* BENEFITS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className="group rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 bg-white"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={b.img}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {b.title}
                </h3>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* INGREDIENTS */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-12">
            Pure & Natural Ingredients
          </h3>

          <div className="flex flex-wrap justify-center gap-10">
            {INGREDIENTS.map((ing, i) => (
              <div key={i} className="group text-center">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden shadow-md group-hover:scale-110 transition duration-300">
                  <img
                    src={ing.img}
                    alt={ing.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-800">
                  {ing.name}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-sm text-gray-500 tracking-wide">
            No Chemicals • No Preservatives • No Artificial Flavors
          </p>
        </div>

      </div>
    </section>
  );
};

export default AchwaniBenefits;
