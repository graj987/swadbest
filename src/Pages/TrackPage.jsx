// src/Pages/TrackPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTracking } from "@/api/shipping";
import {
  Search, Package, Truck, CheckCircle2, Clock, RotateCcw,
  XCircle, MapPin, RefreshCw, AlertCircle, ExternalLink,
  ArrowRight, Leaf, Wifi, WifiOff, X,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const POLL_MS        = 60_000;
const FINAL_STATUSES = ["delivered", "rto", "cancelled"];

const getStatusConfig = (status = "") => {
  const s = status.toLowerCase().replace(/_/g, " ");
  if (s.includes("delivered") && !s.includes("out"))
    return { label:"Delivered",        Icon:CheckCircle2, color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", dot:"bg-emerald-500", step:4 };
  if (s.includes("out for delivery"))
    return { label:"Out for Delivery", Icon:Truck,        color:"text-orange-600",  bg:"bg-orange-50",  border:"border-orange-200",  dot:"bg-orange-500",  step:3 };
  if (s.includes("transit"))
    return { label:"In Transit",       Icon:Truck,        color:"text-amber-600",   bg:"bg-amber-50",   border:"border-amber-200",   dot:"bg-amber-500",   step:2 };
  if (s.includes("pickup") || s.includes("shipped") || s.includes("picked"))
    return { label:"Picked Up",        Icon:Package,      color:"text-violet-600",  bg:"bg-violet-50",  border:"border-violet-200",  dot:"bg-violet-500",  step:1 };
  if (s.includes("rto"))
    return { label:"Returned",         Icon:RotateCcw,    color:"text-rose-600",    bg:"bg-rose-50",    border:"border-rose-200",    dot:"bg-rose-500",    step:0 };
  if (s.includes("cancel"))
    return { label:"Cancelled",        Icon:XCircle,      color:"text-red-600",     bg:"bg-red-50",     border:"border-red-200",     dot:"bg-red-500",     step:0 };
  return   { label:"Processing",       Icon:Clock,        color:"text-sky-600",     bg:"bg-sky-50",     border:"border-sky-200",     dot:"bg-sky-500",     step:0 };
};

const STEPS = [
  { label:"Order Placed",     Icon:Package      },
  { label:"Picked Up",        Icon:Package      },
  { label:"In Transit",       Icon:Truck        },
  { label:"Out for Delivery", Icon:Truck        },
  { label:"Delivered",        Icon:CheckCircle2 },
];

/* ─────────────────────────────────────────────
   SUB COMPONENTS
───────────────────────────────────────────── */
function ProgressStepper({ step }) {
  const pct = step > 0 ? Math.min((step / (STEPS.length - 1)) * 100, 100) : 0;
  return (
    <div className="relative flex items-start justify-between px-2">
      <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 z-0" />
      <div className="absolute top-4 left-6 h-0.5 bg-orange-500 z-0 transition-all duration-700 ease-out"
        style={{ width:`calc((100% - 48px) * ${pct} / 100)` }} />
      {STEPS.map(({ item }, i) => {
        const Icon = item.icon;
        const done = i < step, active = i === step;
        return (
          <div key={i} className="relative z-10 flex flex-col items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
              ${done   ? "bg-orange-500 border-orange-500 shadow-md shadow-orange-500/30" : ""}
              ${active ? "bg-white border-orange-500 ring-4 ring-orange-500/15 shadow-lg" : ""}
              ${!done && !active ? "bg-white border-stone-200" : ""}`}>
              <Icon className={`w-3.5 h-3.5 ${done?"text-white":active?"text-orange-500":"text-stone-300"}`} strokeWidth={2.5} />
            </div>
            <span className={`hidden sm:block text-[10px] font-semibold text-center leading-tight max-w-14
              ${active?"text-orange-600":done?"text-stone-600":"text-stone-400"}`}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Sk({ className }) {
  return <div className={`animate-pulse bg-stone-200 rounded-xl ${className}`} />;
}

function TrackEvent({ event, isFirst }) {
  const raw   = event.date || event.timestamp;
  const d     = raw ? new Date(raw) : null;
  const valid = d && !isNaN(d);
  const fDate = valid ? d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : (typeof raw==="string"?raw:"");
  const fTime = valid ? d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "";
  const text  = event.activity || event.message || event.status || "Update";
  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      <div className="absolute left-3.25 top-7 bottom-0 w-px bg-stone-100" />
      <div className={`relative z-10 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2
        ${isFirst?"bg-orange-500 border-orange-500 shadow-md shadow-orange-500/25":"bg-white border-stone-200"}`}>
        <div className={`w-2 h-2 rounded-full ${isFirst?"bg-white":"bg-stone-300"}`} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-semibold leading-snug ${isFirst?"text-stone-900":"text-stone-500"}`}>{text}</p>
        {event.location && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="text-xs text-stone-400 truncate">{event.location}</span>
          </div>
        )}
        {(fDate||fTime) && <p className="text-[11px] text-stone-400 mt-0.5">{fDate}{fTime&&` · ${fTime}`}</p>}
      </div>
    </li>
  );
}

/* ─────────────────────────────────────────────
   TRACKING RESULT
───────────────────────────────────────────── */
function TrackingResult({ awb }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSeen,   setLastSeen]   = useState(null);
  const [isLive,     setIsLive]     = useState(true);
  const [countdown,  setCountdown]  = useState(POLL_MS / 1000);

  const pollRef    = useRef(null);
  const cdRef      = useRef(null);
  const isFinalRef = useRef(false);

  const extract = useCallback((res) => {
    const p  = res?.data || res;
    const td = p?.tracking_data;
    if (!td) return null;
    const live = td.shipment_track?.[0];
    return {
      current_status: live?.current_status || td.current_status || "",
      courier_name:   live?.courier_name   || td.courier_name   || "",
      etd:            live?.etd            || "",
      history:        td.shipment_track_activities || [],
    };
  }, []);

  const doFetch = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const res    = await getTracking(awb);
      const parsed = extract(res.data);
      if (!parsed) throw new Error("Bad response");
      setData(parsed);
      setIsLive(res.data?.source !== "cached");
      setLastSeen(new Date());
      const sl = parsed.current_status.toLowerCase();
      if (FINAL_STATUSES.some(f => sl.includes(f))) {
        isFinalRef.current = true;
        clearInterval(pollRef.current);
        clearInterval(cdRef.current);
        setCountdown(null);
      }
    } catch {
      setError("Could not load tracking details. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [awb, extract]);

  useEffect(() => {
    doFetch();
    pollRef.current = setInterval(() => { if (!isFinalRef.current) doFetch(true); }, POLL_MS);
    let c = POLL_MS / 1000;
    setCountdown(c);
    cdRef.current = setInterval(() => { c = c<=1 ? POLL_MS/1000 : c-1; setCountdown(c); }, 1000);
    return () => { clearInterval(pollRef.current); clearInterval(cdRef.current); };
  }, [doFetch]);

  if (loading) return (
    <div className="mt-6 space-y-4">
      <Sk className="h-28 w-full" />
      <Sk className="h-20 w-full" />
      <Sk className="h-44 w-full" />
      <div className="space-y-3">{[1,2,3].map(i=><Sk key={i} className="h-16"/>)}</div>
    </div>
  );

  if (error) return (
    <div className="mt-6 bg-white border border-stone-100 rounded-2xl shadow-sm p-8 flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
      <div>
        <p className="font-bold text-stone-800 text-sm">Tracking unavailable</p>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">{error}</p>
      </div>
      <button onClick={()=>doFetch()}
        className="h-9 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all">
        Try again
      </button>
    </div>
  );

  if (!data) return null;

  const cfg     = getStatusConfig(data.current_status);
  const SIcon   = cfg.Icon;
  const isFinal = isFinalRef.current;

  return (
    <div className="mt-6 space-y-4">

      {/* Status card */}
      <div className={`rounded-2xl border-2 p-5 ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border-2 ${cfg.border}`}>
              <SIcon className={`w-6 h-6 ${cfg.color}`} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-stone-400">Current Status</p>
              <p className={`text-xl font-black mt-0.5 ${cfg.color}`}>{cfg.label}</p>
              {data.courier_name && <p className="text-xs text-stone-400 mt-0.5">via {data.courier_name}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button onClick={()=>doFetch(true)} disabled={refreshing||isFinal}
              className="w-9 h-9 rounded-xl bg-white/80 border border-white flex items-center justify-center text-stone-500 hover:text-orange-600 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
              <RefreshCw className={`w-4 h-4 ${refreshing?"animate-spin":""}`} />
            </button>
            {lastSeen && <span className="text-[10px] text-stone-400">{lastSeen.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span>}
          </div>
        </div>

        {data.etd && !isFinal && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-white/70 border border-white flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" strokeWidth={2} />
            <p className="text-xs font-semibold text-stone-600">Expected: <span className="text-stone-800">{data.etd}</span></p>
          </div>
        )}

        <div className="mt-4 pt-3.5 border-t border-white/50 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">AWB Number</p>
            <p className="text-xs font-mono font-black text-stone-700 tracking-widest mt-0.5">{awb}</p>
          </div>
          <a href={`https://shiprocket.co/tracking/${awb}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/80 border border-white text-xs font-bold text-stone-700 hover:text-orange-600 transition-colors shadow-sm">
            Shiprocket <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Live indicator + countdown */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {isLive
            ? <><Wifi className="w-3 h-3 text-emerald-500"/><span className="text-[11px] text-emerald-600 font-semibold">Live tracking</span></>
            : <><WifiOff className="w-3 h-3 text-stone-400"/><span className="text-[11px] text-stone-400">Cached · may be delayed</span></>
          }
        </div>
        {!isFinal && countdown!==null
          ? <span className="text-[10px] text-stone-400 tabular-nums">Next refresh {Math.floor(countdown/60)}:{String(countdown%60).padStart(2,"0")}</span>
          : <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Tracking complete</span>
        }
      </div>

      {/* Progress stepper */}
      {cfg.step > 0 && (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-6">Shipment Progress</p>
          <ProgressStepper step={cfg.step} />
        </div>
      )}

      {/* Timeline */}
      {data.history.length > 0 && (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400">Tracking Updates</p>
            <div className="flex items-center gap-2">
              {refreshing && <RefreshCw className="w-3 h-3 text-stone-400 animate-spin" />}
              <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full">
                {data.history.length} event{data.history.length!==1?"s":""}
              </span>
            </div>
          </div>
          <ol>{data.history.map((ev,i)=><TrackEvent key={i} event={ev} isFirst={i===0}/>)}</ol>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 py-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isFinal?"bg-stone-300":isLive?"bg-emerald-400 animate-pulse":"bg-stone-300"}`} />
        <p className="text-[11px] text-stone-400">
          {isFinal ? "Order journey complete" : "Powered by Shiprocket · Auto-refreshes every 60s"}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE
═══════════════════════════════════════════ */
export default function TrackPage() {
  const { awb: urlAwb } = useParams();
  const navigate        = useNavigate();
  const inputRef        = useRef(null);

  const [input,   setInput]   = useState(urlAwb || "");
  const [active,  setActive]  = useState(urlAwb || "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (urlAwb) { setInput(urlAwb); setActive(urlAwb); }
  }, [urlAwb]);

  const handleTrack = (e) => {
    e?.preventDefault();
    const val = input.trim();
    if (!val) return;
    setActive(val);
    navigate(`/track/${val}`, { replace: true });
  };

  const clearInput = () => {
    setInput(""); setActive("");
    navigate("/track", { replace: true });
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ══════ HERO ══════ */}
      <div className="relative overflow-hidden"
        style={{ background:"linear-gradient(135deg, #431407 0%, #7c2d12 45%, #c2410c 100%)" }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"180px" }} />
        <div className="absolute -top-20 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background:"radial-gradient(circle,#fb923c 0%,transparent 70%)" }} />

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-16">

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-amber-300" strokeWidth={2} />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              <span className="text-orange-400">Swad</span><span className="text-white">Best</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/70 font-bold mb-2">Real-time Tracking</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.05]">
              Where's<br />your order?
            </h1>
            <p className="text-white/50 text-sm mt-3 leading-relaxed max-w-sm">
              Enter your AWB / tracking number from your shipping confirmation email or SMS.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleTrack}>
            <div className={`flex items-center gap-3 h-14 px-4 rounded-2xl border-2 transition-all duration-200
              ${focused ? "bg-white border-white shadow-2xl" : "bg-white/10 border-white/20 backdrop-blur-md"}`}>
              <Search className={`w-5 h-5 shrink-0 transition-colors ${focused?"text-orange-500":"text-white/50"}`} />
              <input
                ref={inputRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onFocus={()=>setFocused(true)}
                onBlur={()=>setFocused(false)}
                placeholder="Enter AWB number  e.g. 1234567890"
                className={`flex-1 text-sm font-medium outline-none bg-transparent transition-colors
                  ${focused?"text-stone-800 placeholder:text-stone-400":"text-white placeholder:text-white/35"}`}
              />
              {input && (
                <button type="button" onClick={clearInput}
                  className={`p-1 rounded-lg transition-colors ${focused?"text-stone-400 hover:text-stone-600":"text-white/50 hover:text-white"}`}>
                  <X className="w-4 h-4" />
                </button>
              )}
              <button type="submit" disabled={!input.trim()}
                className="h-9 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-lg shadow-orange-600/30">
                Track <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Hint pills */}
          <div className="flex flex-wrap gap-2 mt-4 items-center">
            <span className="text-[11px] text-white/40 font-medium">AWB is in:</span>
            {["Shipping SMS", "Email confirmation", "My Orders"].map(h=>(
              <span key={h} className="text-[11px] font-semibold text-white/60 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">{h}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ CONTENT ══════ */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        {active ? (
          <TrackingResult key={active} awb={active} />
        ) : (
          <div className="mt-10 space-y-5">

            {/* How it works */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-5">How it works</p>
              <div className="space-y-4">
                {[
                  { n:"1", t:"Enter your AWB",    d:"Find it in your shipping confirmation email, SMS, or on the My Orders page." },
                  { n:"2", t:"Get live updates",  d:"We fetch real-time status from Shiprocket and auto-refresh every 60 seconds." },
                  { n:"3", t:"Track every step",  d:"Packed → Picked up → In transit → Out for delivery → Delivered." },
                ].map(({ n, t, d }) => (
                  <div key={n} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{n}</div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">{t}</p>
                      <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Orders CTA */}
            <Link to="/orders"
              className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-2xl hover:bg-orange-100 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-200 flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">View My Orders</p>
                  <p className="text-xs text-stone-500 mt-0.5">Track any order directly from your account</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}