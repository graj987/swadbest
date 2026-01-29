import { useEffect, useState } from "react";
import { getTracking } from "@/api/shipping";

const TrackOrder = ({ awb }) => {
  const [tracking, setTracking] = useState(null);

  useEffect(() => {
    if (!awb) return;

    getTracking(awb)
      .then(res => setTracking(res.data))
      .catch(console.error);
  }, [awb]);

  if (!awb) return <p>Not shipped yet</p>;
  if (!tracking) return <p>Loading tracking...</p>;

  return (
    <div>
      <h3>Status: {tracking.current_status}</h3>
      <ul>
        {tracking.track_history.map((t, i) => (
          <li key={i}>
            {t.date} – {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrackOrder;
