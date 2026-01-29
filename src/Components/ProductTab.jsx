import { useState } from "react";

const TABS = ["description", "additional", "reviews"];

const ProductTabs = ({ product }) => {
  const [active, setActive] = useState("description");

  return (
    <div>
      {/* TAB HEADERS */}
      <div className="flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-6 py-3 text-sm font-semibold capitalize transition
              ${
                active === tab
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab === "additional" ? "Additional Information" : tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="p-6 text-sm text-gray-700 leading-relaxed">
        {active === "description" && (
          <Description product={product} />
        )}

        {active === "additional" && (
          <AdditionalInfo product={product} />
        )}

        {active === "reviews" && (
          <Reviews />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;

/* ================= DESCRIPTION ================= */
const Description = ({ product }) => (
  <div className="space-y-4">
    <p>
      {product.description ||
        "This product is crafted using traditional methods and high-quality ingredients to deliver authentic taste and aroma."}
    </p>

    <p>
      Ideal for daily cooking, festive meals, and special recipes. Store in a
      cool, dry place for long-lasting freshness.
    </p>
  </div>
);

/* ================= ADDITIONAL INFO ================= */
const AdditionalInfo = ({ product }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border text-sm">
      <tbody>
        <Row label="Product Name" value={product.name} />
        <Row label="Category" value={product.category} />
        <Row label="Available Variants" value={product.variants?.map(v => v.weight).join(", ")} />
        <Row label="Shelf Life" value="6–12 Months" />
        <Row label="Storage" value="Store in a cool & dry place" />
        <Row label="Country of Origin" value="India" />
      </tbody>
    </table>
  </div>
);

const Row = ({ label, value }) => (
  <tr className="border-b">
    <td className="px-4 py-3 font-medium text-gray-600 w-1/3">
      {label}
    </td>
    <td className="px-4 py-3 text-gray-800">
      {value || "-"}
    </td>
  </tr>
);

/* ================= REVIEWS ================= */
const Reviews = () => (
  <div className="text-center py-10">
    <p className="text-gray-500">
      No reviews yet.
    </p>
    <p className="text-sm text-gray-400 mt-2">
      Be the first to review this product after purchase.
    </p>
  </div>
);
