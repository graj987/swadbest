import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "@/api";
import OrderTimeline from "@/Components/OrderTimeline";

export default function TrackOrder() {
  const { awb } = useParams();
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/api/shiprocket/track/${awb}`);
        const acts =
          res.data?.data?.tracking_data?.shipment_track_activities || [];

        setEvents(acts.reverse());
        setStatus(acts[0]?.status || "");
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [awb]);

  if (loading) return <p className="p-6">Loading tracking…</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        Tracking — AWB {awb}
      </h2>

      <OrderTimeline status={status} />

      <div className="mt-6 space-y-4">
        {events.map((e, i) => (
          <div
            key={i}
            className="border p-3 rounded bg-gray-50"
          >
            <p className="font-semibold">{e.status}</p>
            <p className="text-sm text-gray-600">
              {e.location || "—"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(e.date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
