import React from "react";

const BENEFITS = [
  {
    icon: "🔥",
    title: "Boosts Metabolism",
    desc: "Improves digestion and helps the body burn food efficiently",
  },
  {
    icon: "🍽️",
    title: "Aids Digestion",
    desc: "Reduces gas, bloating and improves gut health naturally",
  },
  {
    icon: "🤰",
    title: "Pregnancy Friendly",
    desc: "Traditionally used for women’s health and post-meal comfort",
  },
  {
    icon: "⚡",
    title: "Natural Energy",
    desc: "Keeps the body active without chemicals or preservatives",
  },
  {
    icon: "🛡️",
    title: "Immunity Support",
    desc: "Spices strengthen immunity and fight seasonal weakness",
  },
  {
    icon: "🌿",
    title: "100% Homemade",
    desc: "Prepared in small batches using traditional methods",
  },
];

const INGREDIENTS = [
  { name: "Ginger", icon: "🫚" },
  { name: "Mishri", icon: "🍬" },
  { name: "Ghee", icon: "🧈" },
  { name: "Ajwain", icon: "🌰" },
  { name: "Turmeric", icon: "🟡" },
  { name: "Black Pepper", icon: "⚫" },
  { name: "Honey", icon: "🍯" },
];

const AchwaniBenefits = () => {
  return (
    <section className="bg-[#fff7ed] py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-orange-600">
            Why Achwani Spice is Special 🌿
          </h2>
          <p className="mt-4 text-gray-700 text-base md:text-lg">
            Achwani is a traditional homemade spice blend made from natural
            ingredients like ginger, ghee, ajwain, turmeric and honey.
            It is crafted to improve digestion, boost metabolism and
            support overall health — just like our elders prepared at home.
          </p>
        </div>

        {/* BENEFITS GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{b.icon}</div>
              <h3 className="font-bold text-lg mb-2">{b.title}</h3>
              <p className="text-sm text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* INGREDIENTS */}
        <div className="bg-white rounded-3xl p-8 shadow-md">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Made With Pure & Natural Ingredients
          </h3>

          <div className="flex flex-wrap justify-center gap-6">
            {INGREDIENTS.map((ing, i) => (
              <div
                key={i}
                className="flex flex-col items-center bg-orange-50 px-5 py-4 rounded-xl w-28"
              >
                <span className="text-3xl">{ing.icon}</span>
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  {ing.name}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            No chemicals • No preservatives • No artificial flavors
          </p>
        </div>
      </div>
    </section>
  );
};

export default AchwaniBenefits;
