import { useState } from "react";
import {
  createShiprocketOrder,
  generateAWB,
  generateManifest,
} from "@/api/shipping";

const ShipOrderButton = ({ order }) => {
  const [loading, setLoading] = useState(false);

  const handleShip = async () => {
    try {
      setLoading(true);

      // 1. Create Shiprocket Order
      const { data: orderRes } = await createShiprocketOrder(order._id);

      if (!orderRes?.shipment_id) {
        throw new Error("Shipment ID missing from Shiprocket order response");
      }

      // 2. Generate AWB
      const { data: awbRes } = await generateAWB(orderRes.shipment_id);

      if (!awbRes?.awb_code) {
        throw new Error("AWB generation failed");
      }

      console.log("AWB Number:", awbRes.awb_code);

      // 3. Generate Manifest
      await generateManifest(orderRes.shipment_id);

      alert(`Order shipped successfully\nAWB: ${awbRes.awb_code}`);
      window.location.reload(); // acceptable for admin action
    } catch (err) {
      console.error("Shipping error:", err);
      alert("Shipping failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleShip}
      className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
    >
      {loading ? "Shipping..." : "Ship Order"}
    </button>
  );
};

export default ShipOrderButton;
