import React from "react";

const TESTIMONIALS = [
  {
    name: "Dr. R. Mishra",
    role: "Ayurvedic Practitioner",
    text: "Achwani is a traditional digestive blend. Ingredients like ajwain, ginger, turmeric and ghee help balance digestion, reduce gas and improve metabolism naturally when taken after meals.",
  },
  {
    name: "Sita Devi",
    role: "Homemaker • Bihar",
    text: "We have been using Achwani after meals for years. It helps digestion and gives comfort, especially for women. This homemade version tastes pure and effective.",
  },
  {
    name: "Amit Kumar",
    role: "Fitness Enthusiast",
    text: "I take Achwani after heavy meals. It prevents bloating and keeps my stomach light. Much better than tablets or chemicals.",
  },
];

const AyurvedaTestimonials = () => {
  return (
    <section className="bg-[#fffaf4] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-orange-600 mb-10">
          Trusted by Tradition & Experience
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="
        relative p-6 rounded-2xl
        bg-gradient-to-br from-[#6b2b1a] via-[#8b3a1f] to-[#5a1f14]
        text-white
        shadow-lg hover:shadow-2xl
        transition
      "
            >
              {/* subtle overlay for softness */}
              <div className="absolute inset-0 bg-black/10 rounded-2xl pointer-events-none" />

              <p className="relative text-sm leading-relaxed mb-4 text-orange-50">
                “{t.text}”
              </p>

              <div className="relative border-t border-white/20 pt-3">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-orange-100/80">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AyurvedaTestimonials;
