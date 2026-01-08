import { useState } from "react";
import {
  FaLeaf,
  FaHeart,
  FaMortarPestle,
  FaShieldAlt,
  FaFlask,
} from "react-icons/fa";

export default function AboutUs() {
  const [open, setOpen] = useState(false);

  return (
    <main className="bg-white text-gray-800">

      {/* PRODUCT HERO */}
      <section className="px-5 pt-10 pb-14 max-w-7xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">

          <img
            src="/img/coverimg.jpg"
            alt="Achwani Masala"
            className="w-full rounded-2xl shadow-md animate-float"
            loading="lazy"
          />

          <div>
            <span className="text-xs tracking-widest uppercase text-orange-600">
              Our First Product
            </span>

            <h1 className="text-3xl md:text-4xl font-bold mt-2 leading-tight">
              Achwani Masala
            </h1>

            {/* INGREDIENT COUNT BADGES */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge text="12+ Natural Ingredients" />
              <Badge text="No Preservatives" />
              <Badge text="Daily Cooking Safe" />
            </div>

            <p className="mt-4 text-gray-600 leading-relaxed">
              A traditionally crafted spice blend made using carefully
              selected natural ingredients to enhance taste while
              supporting everyday health.
            </p>

            {/* ACTION */}
            <button
              onClick={() => setOpen(true)}
              className="mt-6 inline-block rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition"
            >
              View Nutrition Information
            </button>
          </div>
        </div>
      </section>

      {/* TRUST MICROCOPY */}
      <section className="bg-gray-50 py-10">
        <div className="px-5 max-w-6xl mx-auto grid gap-6 sm:grid-cols-3">

          <Trust
            icon={<FaShieldAlt />}
            title="Hygienically Prepared"
            text="Processed under strict hygiene practices."
          />

          <Trust
            icon={<FaMortarPestle />}
            title="Handcrafted"
            text="Prepared in small batches using traditional methods."
          />

          <Trust
            icon={<FaFlask />}
            title="Tested & Certified"
            text="FSSAI certified for food safety compliance."
          />

        </div>
      </section>

      {/* HEALTH FEATURES */}
      <section className="bg-orange-50 py-12">
        <div className="px-5 max-w-6xl mx-auto">

          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
            What Makes It Healthy
          </h2>

          <div className="grid gap-6 md:grid-cols-3">

            <Feature
              icon={<FaMortarPestle />}
              title="Balanced Ingredients"
              text="A well-proportioned blend of spices used in everyday Indian kitchens."
            />

            <Feature
              icon={<FaLeaf />}
              title="Clean Label"
              text="No artificial colors, flavors, or chemical additives."
            />

            <Feature
              icon={<FaHeart />}
              title="Wellness Support"
              text="Supports digestion and overall daily nutrition."
            />

          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="px-5 py-14 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Why SwadBest
        </h2>

        <p className="text-gray-600 leading-relaxed max-w-3xl">
          SwadBest was created to deliver pure, honest, and
          health-conscious kitchen essentials. We focus on
          quality, hygiene, and transparency—without mass-production shortcuts.
        </p>
      </section>

      {/* FUTURE */}
      <section className="bg-gray-100 py-12">
        <div className="px-5 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Looking Ahead
          </h2>
          <p className="text-gray-600 max-w-3xl leading-relaxed">
            Achwani Masala is just the beginning. SwadBest will
            continue introducing pure and healthy kitchen products
            designed for modern Indian households.
          </p>
        </div>
      </section>

      {/* NUTRITION MODAL */}
      {open && <NutritionModal onClose={() => setOpen(false)} />}
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Badge({ text }) {
  return (
    <span className="text-xs rounded-full bg-orange-100 text-orange-700 px-3 py-1">
      {text}
    </span>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="text-3xl text-orange-500 mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function Trust({ icon, title, text }) {
  return (
    <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
      <div className="text-2xl text-green-600">{icon}</div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
}

function NutritionModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-white rounded-xl w-[90%] max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          Nutrition Information (Approx.)
        </h3>

        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Energy: Low calorie per serving</li>
          <li>• Fat: Naturally occurring spice oils</li>
          <li>• Sugar: 0g added sugar</li>
          <li>• Sodium: No added MSG</li>
          <li>• Suitable for daily cooking</li>
        </ul>

        <p className="text-xs text-gray-400 mt-4">
          Values are indicative and may vary slightly due to natural ingredients.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}
