import React from "react";

const DigestiveComparison = () => {
  return (
    <section className="bg-[#fff7ed] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-orange-600 mb-12">
          Feel the Difference After Meals
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* WITHOUT */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h3 className="font-bold text-lg mb-4 text-red-500">
              Without Achwani
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>❌ Heavy stomach after meals</li>
              <li>❌ Gas & bloating</li>
              <li>❌ Slow digestion</li>
              <li>❌ Tiredness after eating</li>
            </ul>
          </div>

          {/* WITH */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h3 className="font-bold text-lg mb-4 text-green-600">
              With Achwani
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>✅ Light & comfortable stomach</li>
              <li>✅ Better digestion</li>
              <li>✅ Reduced gas & acidity</li>
              <li>✅ Energetic feeling after meals</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DigestiveComparison;
