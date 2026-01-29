import {
  Package,
  Truck,
  MapPin,
  Home,
  XCircle,
} from "lucide-react";

const TIMELINE = [
  "placed",
  "preparing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

const LABELS = {
  placed: "Order Placed",
  preparing: "Preparing Order",
  shipped: "Shipped",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

const ICONS = {
  placed: Package,
  preparing: Package,
  shipped: Truck,
  in_transit: MapPin,
  out_for_delivery: Truck,
  delivered: Home,
  cancelled: XCircle,
  rto: XCircle,
};

/* 🔒 HARD NORMALIZATION (REAL SHIPROCKET SAFE) */
const normalizeStatus = (status = "") => {
  const s = status.toLowerCase().trim();

  if (s.includes("cancel")) return "cancelled";
  if (s.includes("rto")) return "rto";
  if (s.includes("deliver")) return "delivered";
  if (s.includes("out")) return "out_for_delivery";
  if (s.includes("transit")) return "in_transit";
  if (s.includes("ship")) return "shipped";
  if (s.includes("prepar")) return "preparing";

  return "placed";
};

export default function OrderTimeline({ status }) {
  const normalized = normalizeStatus(status);

  /* ❌ CANCEL / RTO — STOP EVERYTHING */
  if (["cancelled", "rto"].includes(normalized)) {
    const Icon = ICONS[normalized];
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-50">
        <Icon className="text-red-600" />
        <div>
          <p className="font-semibold text-red-700">
            {normalized === "rto"
              ? "Returned to Origin"
              : "Order Cancelled"}
          </p>
          <p className="text-sm text-red-500">
            This shipment is no longer active
          </p>
        </div>
      </div>
    );
  }

  let activeIndex = TIMELINE.indexOf(normalized);

  /* 🛡️ SAFETY NET */
  if (activeIndex < 0) activeIndex = 0;

  return (
    <div className="relative pl-8 space-y-8">
      {/* Vertical line */}
      <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-gray-200" />

      {TIMELINE.map((step, idx) => {
        const active = idx <= activeIndex;
        const current = idx === activeIndex;
        const Icon = ICONS[step];

        return (
          <div key={step} className="relative flex gap-4">
            {/* DOT */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2
              transition-all duration-300
              ${
                active
                  ? "bg-orange-500 border-orange-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-white" : "text-gray-400"}
              />
            </div>

            {/* TEXT */}
            <div>
              <p
                className={`font-medium ${
                  current
                    ? "text-orange-600"
                    : active
                    ? "text-gray-800"
                    : "text-gray-400"
                }`}
              >
                {LABELS[step]}
              </p>

              {current && (
                <p className="text-xs text-orange-500">
                  Current status
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
