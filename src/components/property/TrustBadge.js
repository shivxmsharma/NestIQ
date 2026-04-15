"use client";

const STYLES = {
  emerald: {
    wrap: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    dot: "bg-emerald-400",
    pulse: true,
  },
  blue: {
    wrap: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300",
    dot: "bg-indigo-400",
    pulse: false,
  },
  amber: {
    wrap: "bg-amber-500/20 border-amber-500/30 text-amber-300",
    dot: "bg-amber-400",
    pulse: false,
  },
  red: {
    wrap: "bg-red-500/20 border-red-500/30 text-red-300",
    dot: "bg-red-400",
    pulse: false,
  },
};

export default function TrustBadge({ score, size = "sm" }) {
  if (score == null) return null;

  let color, label;
  if (score >= 80) { color = "emerald"; label = "Highly Trusted"; }
  else if (score >= 60) { color = "blue"; label = "Verified"; }
  else if (score >= 40) { color = "amber"; label = "Moderate"; }
  else { color = "red"; label = "Unverified"; }

  const s = STYLES[color];

  if (size === "lg") {
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${s.wrap}`}>
        <span className={`w-2 h-2 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
        {label}
        <span className="font-bold">{score}/100</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${s.wrap}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {score}/100
    </span>
  );
}