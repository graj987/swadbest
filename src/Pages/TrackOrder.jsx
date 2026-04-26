import { useEffect, useRef, useState, useCallback } from "react";
import { getTracking } from "@/api/shipping";
import {
  Package, Truck, CheckCircle2, Clock, RotateCcw, XCircle,
  MapPin, RefreshCw, AlertCircle, ExternalLink, Wifi, WifiOff,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const POLL_INTERVAL  = 60 * 1000; // 60s — avoids Shiprocket rate limits
const FINAL_STATUSES = ["delivered", "rto", "cancelled"];

/* ─────────────────────────────────────────────
   STATUS CONFIG
   FIX: normalise underscores to spaces before matching
   Shiprocket returns "Out for Delivery" not "out_for_delivery"
───────────────────────────────────────────── */
const getStatusConfig = (status = "") => {
  const s = status.toLowerCase().replace(/_/g, " ");
  if (s.includes("delivered") && !s.includes("out"))
    return { label:"Delivered",        icon:CheckCircle2, color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", dot:"bg-emerald-500", step:4 };
  if (s.includes("out for delivery") || s.includes("out_for_delivery"))
    return { label:"Out for Delivery", icon:Truck,        color:"text-orange-600",  bg:"bg-orange-50",  border:"border-orange-200",  dot:"bg-orange-500",  step:3 };
  if (s.includes("transit"))
    return { label:"In Transit",       icon:Truck,        color:"text-amber-600",   bg:"bg-amber-50",   border:"border-amber-200",   dot:"bg-amber-500",   step:2 };
  if (s.includes("pickup") || s.includes("shipped") || s.includes("picked"))
    return { label:"Picked Up",        icon:Package,      color:"text-violet-600",  bg:"bg-violet-50",  border:"border-violet-200",  dot:"bg-violet-500",  step:1 };
  if (s.includes("rto"))
    return { label:"Returned",         icon:RotateCcw,    color:"text-rose-600",    bg:"bg-rose-50",    border:"border-rose-200",    dot:"bg-rose-500",    step:0 };
  if (s.includes("cancel"))
    return { label:"Cancelled",        icon:XCircle,      color:"text-red-600",     bg:"bg-red-50",     border:"border-red-200",     dot:"bg-red-500",     step:0 };
  return   { label:"Processing",       icon:Clock,        color:"text-sky-600",     bg:"bg-sky-50",     border:"border-sky-200",     dot:"bg-sky-500",     step:0 };
};

/* ─────────────────────────────────────────────
   PROGRESS STEPPER
───────────────────────────────────────────── */
const STEPS = [
  { label:"Order Placed",     icon:Package      },
  { label:"Picked Up",        icon:Package      },
  { label:"In Transit",       icon:Truck        },
  { label:"Out for Delivery", icon:Truck        },
  { label:"Delivered",        icon:CheckCircle2 },
];

function ProgressBar({ step }) {
  const pct = step > 0 ? Math.min((step / (STEPS.length - 1)) * 100, 100) : 0;
  return (
    <div className="relative flex items-start justify-between px-1">
      <div className="absolute top-4 left-5 right-5 h-0.5 bg-stone-200 z-0" />
      <div className="absolute top-4 left-5 h-0.5 bg-amber-500 z-0 transition-all duration-700 ease-out" style={{ width:`${pct}%` }} />
      {STEPS.map((s, i) => {
        const done = i < step, active = i === step;
        const Icon = s.icon;
        return (
          <div key={i} className="relative z-10 flex flex-col items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
              ${done   ? "bg-amber-500 border-amber-500 shadow-md shadow-amber-500/30" : ""}
              ${active ? "bg-white border-amber-500 shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10" : ""}
              ${!done && !active ? "bg-white border-stone-200" : ""}`}>
              <Icon className={`w-3.5 h-3.5 ${done?"text-white":active?"text-amber-600":"text-stone-300"}`} strokeWidth={2.5} />
            </div>
            <span className={`text-[10px] font-semibold text-center leading-tight max-w-15 ${active?"text-amber-700":done?"text-stone-600":"text-stone-400"}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-stone-200 rounded-xl ${className}`} />;
}
function TrackingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="space-y-3">{[1,2,3].map(i=><Skeleton key={i} className="h-14 w-full"/>)}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TIMELINE EVENT
   FIX: handle both Shiprocket live (event.activity) and DB cached (event.message)
───────────────────────────────────────────── */
function TimelineEvent({ event, isFirst }) {
  const rawDate  = event.date || event.timestamp;
  const dateObj  = rawDate ? new Date(rawDate) : null;
  const isValid  = dateObj && !isNaN(dateObj.getTime());
  const fmtDate  = isValid ? dateObj.toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"}) : (typeof rawDate==="string" ? rawDate : "");
  const fmtTime  = isValid ? dateObj.toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit"}) : "";
  const text     = event.activity || event.message || event.status || "Update";

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      <div className="absolute left-3.25 top-7 bottom-0 w-px bg-stone-100" />
      <div className={`relative z-10 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2
        ${isFirst?"bg-amber-500 border-amber-500 shadow-md shadow-amber-500/25":"bg-white border-stone-200"}`}>
        <div className={`w-2 h-2 rounded-full ${isFirst?"bg-white":"bg-stone-300"}`} />
      </div>
      <div className="flex-1 pt-0.5 pb-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${isFirst?"text-stone-900":"text-stone-600"}`}>{text}</p>
        {event.location && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="text-xs text-stone-400 truncate">{event.location}</span>
          </div>
        )}
        {(fmtDate||fmtTime) && (
          <p className="text-[11px] text-stone-400 mt-0.5">{fmtDate}{fmtTime && ` · ${fmtTime}`}</p>
        )}
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const TrackOrder = ({ awb }) => {
  const [tracking,    setTracking]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive,      setIsLive]      = useState(true);
  const [nextPollIn,  setNextPollIn]  = useState(null);

  const intervalRef  = useRef(null);
  const countdownRef = useRef(null);
  const isFinalRef   = useRef(false);

  /* ── unwrap Shiprocket response structure ──
     Our backend returns:
       res.data = { success, source, data: { tracking_data: { ... } } }

     tracking_data shape (live Shiprocket):
       .shipment_track[0].current_status  ← current status string
       .shipment_track_activities[]       ← event history

     tracking_data shape (DB cached fallback):
       .current_status
       .shipment_track_activities[]
  ── */
  const extractTracking = useCallback((responseData) => {
    const payload = responseData?.data || responseData;
    const td      = payload?.tracking_data;
    if (!td) return null;

    const liveTrack     = td.shipment_track?.[0];
    const currentStatus = liveTrack?.current_status || td.current_status || "";
    const courierName   = liveTrack?.courier_name   || td.courier_name   || "";
    const etd           = liveTrack?.etd            || "";
    const activities    = td.shipment_track_activities || [];

    return { current_status: currentStatus, courier_name: courierName, etd, track_history: activities };
  }, []);

  /* ── fetch ── */
  const fetchTracking = useCallback(async (isRefresh = false) => {
    if (!awb) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      const res    = await getTracking(awb);
      const parsed = extractTracking(res.data);
      if (!parsed) throw new Error("Invalid tracking response structure");

      setTracking(parsed);
      setIsLive(res.data?.source !== "cached");
      setLastUpdated(new Date());

      // Stop polling for terminal states
      const sl = parsed.current_status.toLowerCase();
      if (FINAL_STATUSES.some(f => sl.includes(f))) {
        isFinalRef.current = true;
        clearInterval(intervalRef.current);
        clearInterval(countdownRef.current);
        setNextPollIn(null);
      }
    } catch {
      setError("Unable to fetch tracking details. Please try again.");
      setIsLive(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [awb, extractTracking]);

  /* ── auto-poll ── */
  useEffect(() => {
    if (!awb) return;

    fetchTracking(); // immediate first fetch

    intervalRef.current = setInterval(() => {
      if (!isFinalRef.current) fetchTracking(true);
    }, POLL_INTERVAL);

    // countdown display
    let remaining = POLL_INTERVAL / 1000;
    setNextPollIn(remaining);
    countdownRef.current = setInterval(() => {
      remaining = remaining <= 1 ? POLL_INTERVAL / 1000 : remaining - 1;
      setNextPollIn(remaining);
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [awb, fetchTracking]);

  /* ── not shipped ── */
  if (!awb) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
          <Package className="w-5 h-5 text-stone-400" />
        </div>
        <p className="text-sm font-semibold text-stone-600">Not shipped yet</p>
        <p className="text-xs text-stone-400">Tracking will appear once your order is dispatched.</p>
      </div>
    );
  }

  if (loading) return <TrackingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm font-semibold text-stone-700">{error}</p>
        <button onClick={() => fetchTracking()} className="text-xs font-bold text-amber-700 hover:text-amber-600 transition-colors">
          Try again
        </button>
      </div>
    );
  }

  if (!tracking) return null;

  const cfg        = getStatusConfig(tracking.current_status);
  const StatusIcon = cfg.icon;
  const history    = tracking.track_history || [];
  const isFinal    = isFinalRef.current;

  return (
    <div className="space-y-4">

      {/* ── Status hero card ── */}
      <div className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border ${cfg.border}`}>
              <StatusIcon className={`w-5 h-5 ${cfg.color}`} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-stone-400 mb-0.5">Current Status</p>
              <p className={`text-base font-black ${cfg.color}`}>{cfg.label}</p>
              {tracking.courier_name && (
                <p className="text-[11px] text-stone-400 mt-0.5">via {tracking.courier_name}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={() => fetchTracking(true)}
              disabled={refreshing || isFinal}
              title={isFinal ? "Tracking complete" : "Refresh now"}
              className="w-8 h-8 rounded-xl bg-white/70 border border-white/80 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            {lastUpdated && (
              <span className="text-[10px] text-stone-400">
                {lastUpdated.toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit"})}
              </span>
            )}
          </div>
        </div>

        {/* ETD */}
        {tracking.etd && !isFinal && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-white/60 border border-white/80 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" strokeWidth={2} />
            <p className="text-xs font-semibold text-stone-600">
              Expected delivery: <span className="text-stone-800">{tracking.etd}</span>
            </p>
          </div>
        )}

        {/* AWB + Shiprocket link */}
        <div className="mt-3.5 pt-3.5 border-t border-white/60 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-stone-400 font-medium">Tracking ID</p>
            <p className="text-xs font-mono font-bold text-stone-700 tracking-wider">{awb}</p>
          </div>
          <a
            href={`https://shiprocket.co/tracking/${awb}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-600 transition-colors"
          >
            Shiprocket <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ── Live/cached + countdown row ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {isLive
            ? <><Wifi className="w-3 h-3 text-emerald-500" /><span className="text-[11px] text-emerald-600 font-semibold">Live data</span></>
            : <><WifiOff className="w-3 h-3 text-stone-400" /><span className="text-[11px] text-stone-400 font-medium">Cached · may not reflect latest</span></>
          }
        </div>
        {!isFinal && nextPollIn !== null ? (
          <span className="text-[10px] text-stone-400">
            Next refresh in {Math.floor(nextPollIn / 60)}:{String(nextPollIn % 60).padStart(2,"0")}
          </span>
        ) : isFinal ? (
          <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            Tracking complete
          </span>
        ) : null}
      </div>

      {/* ── Progress stepper ── */}
      {cfg.step > 0 && (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-5">Shipment Progress</p>
          <ProgressBar step={cfg.step} />
        </div>
      )}

      {/* ── Timeline ── */}
      {history.length > 0 && (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400">Tracking Updates</p>
            <div className="flex items-center gap-2">
              {refreshing && <RefreshCw className="w-3 h-3 text-stone-400 animate-spin" />}
              <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full">
                {history.length} event{history.length!==1?"s":""}
              </span>
            </div>
          </div>
          <ol className="relative space-y-0">
            {history.map((event, i) => (
              <TimelineEvent key={i} event={event} isFirst={i===0} />
            ))}
          </ol>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        <div className={`w-1.5 h-1.5 rounded-full ${isFinal ? "bg-stone-300" : isLive ? "bg-emerald-400 animate-pulse" : "bg-stone-300"}`} />
        <p className="text-[11px] text-stone-400 font-medium">
          {isFinal ? "Tracking complete · No further updates" : "Powered by Shiprocket · Auto-refreshes every 60s"}
        </p>
      </div>
    </div>
  );
};

export default TrackOrder;