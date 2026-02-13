import React from "react";

const STEPS = [
  {
    img: "/img/mealpate.jpg",
    title: "After Meals",
    desc: "Consume Achwani immediately after lunch or dinner.",
  },
  {
    img: "/img/spoon.avif",
    title: "Recommended Quantity",
    desc: "Take ½ to 1 teaspoon according to your preference.",
  },
  {
    img: "/img/waterglass.jpg",
    title: "Avoid Water",
    desc: "Do not drink water immediately after consumption.",
  },
  {
    img: "/img/watch.jpg",
    title: "Wait 30 Minutes",
    desc: "Drink water only after 30 minutes for optimal results.",
  },
];

const AchwaniUsage = () => {
  return (
    <section className="bg-gradient-to-b from-white to-orange-50 py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            How to Use <span className="text-orange-600">Achwani</span>
          </h2>
          <p className="mt-6 text-gray-600 text-lg">
            Follow these simple steps to get the best digestive benefits.
          </p>
        </div>

        {/* STEPS */}
        <div className="grid md:grid-cols-4 gap-10 relative">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden group"
            >
              {/* Step Number */}
              <div className="absolute top-4 left-4 w-10 h-10 bg-orange-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-md z-10">
                {i + 1}
              </div>

              {/* Image */}
              <div className="h-40 overflow-hidden">
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-sm text-gray-500 mt-16 max-w-2xl mx-auto">
          ⚠️ For pregnant women, consume in moderate quantity as part of a balanced diet.
          Consult a healthcare professional if required.
        </p>
      </div>
    </section>
  );
};

export default AchwaniUsage;
