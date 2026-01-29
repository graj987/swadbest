import React from "react";

const STEPS = [
  {
    icon: "🍽️",
    title: "After Meals",
    desc: "Take Achwani immediately after lunch or dinner",
  },
  {
    icon: "🥄",
    title: "Recommended Quantity",
    desc: "Take ½ to 1 teaspoon as per taste",
  },
  {
    icon: "🚫💧",
    title: "Do Not Drink Water",
    desc: "Avoid drinking water immediately after consuming Achwani",
  },
  {
    icon: "⏱️",
    title: "Wait 30 Minutes",
    desc: "Drink water only after 30 minutes for best results",
  },
];

const AchwaniUsage = () => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-orange-600 mb-12">
          How to Use Achwani for Best Results
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="bg-orange-50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          ⚠️ For pregnant women, use in moderate quantity as part of a balanced diet.
        </p>
      </div>
    </section>
  );
};

export default AchwaniUsage;
