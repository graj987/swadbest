import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "@/api";
import OrderTimeline from "@/Components/OrderTimeline";

/* ---------- normalize status ---------- */
const normalizeStatus = (s = "") => {
  s = s.toLowerCase();

  if (s.includes("delivered")) return "delivered";
  if (s.includes("out for delivery")) return "out_for_delivery";
  if (s.includes("transit")) return "in_transit";
  if (s.includes("shipped") || s.includes("pickup")) return "shipped";
  if (s.includes("rto")) return "rto";
  if (s.includes("cancel")) return "cancelled";

  return "created";
};

export default function TrackOrder() {
  const { awb } = useParams();

  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("created");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await API.get(`/api/shiprocket/track/${awb}`);

        /* works for BOTH live + cached responses */
        const activities =
          res.data?.data?.tracking_data?.shipment_track_activities ||
          res.data?.data?.tracking_data?.shipment_track ||
          [];

        if (!Array.isArray(activities)) {
          setEvents([]);
          return;
        }

        /* ensure correct chronological order */
        const sorted = [...activities].sort(
          (a, b) => new Date(a.date || a.updated_at) - new Date(b.date || b.updated_at)
        );

        setEvents(sorted);

        const latest = sorted[sorted.length - 1];
        setStatus(normalizeStatus(latest?.status || latest?.current_status));

        setUpdatedAt(new Date());
      } catch (err) {
        console.warn("Tracking fetch failed",err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();

    /* poll every 30s — logistics doesn’t need 15s spam */
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [awb]);

  if (loading) return <p className="p-6">Loading tracking…</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">
        Tracking — AWB {awb}
      </h2>

      {updatedAt && (
        <p className="text-xs text-gray-500 mb-4">
          Last updated: {updatedAt.toLocaleTimeString()}
        </p>
      )}

      {/* Timeline uses normalized lifecycle */}
      <OrderTimeline status={status} />

      {/* EVENTS */}
      <div className="mt-6 space-y-4">
        {events.length === 0 && (
          <p className="text-gray-500 text-sm">
            Tracking updates not available yet. Please check again later.
          </p>
        )}

        {events.map((e, i) => (
          <div key={i} className="border p-4 rounded-lg bg-gray-50">
            <p className="font-semibold">
              {e.status || e.current_status || "Update"}
            </p>

            <p className="text-sm text-gray-600">
              {e.location || e.city || "Location not provided"}
            </p>

            <p className="text-xs text-gray-500">
              {new Date(e.date || e.updated_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
