"use client";
import { useState } from "react";
import {
  Sparkles, CheckCircle2, AlertCircle, AlertTriangle,
  TrendingUp, Loader2, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";

const VERDICT = {
  GOOD_DEAL: { label: "Good Deal", cls: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30", emoji: "🟢" },
  FAIR: { label: "Fair Listing", cls: "text-indigo-300 bg-indigo-500/20 border-indigo-500/30", emoji: "🔵" },
  NEEDS_CAUTION: { label: "Needs Caution", cls: "text-amber-300 bg-amber-500/20 border-amber-500/30", emoji: "🟡" },
};

export default function PropertyAIInsights({ propertyId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/analyze/${propertyId}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const analysis = data?.analysis;
  const verdict = analysis ? (VERDICT[analysis.overallVerdict] ?? VERDICT.FAIR) : null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-base">AI Property Analysis</p>
            <p className="text-xs text-slate-400">Powered by Google Gemini</p>
          </div>
        </div>
        {analysis && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Prompt state */}
      {!analysis && !loading && (
        <div className="px-6 pb-6 shrink-0">
          <p className="text-sm text-slate-300 mb-5 leading-relaxed">
            Get an instant AI breakdown of this listing — price fairness, pros &amp; cons, red flags, neighbourhood context, and actionable buyer tips.
          </p>
          <button
            onClick={run}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Analyse this Property
          </button>
          {error && (
            <p className="mt-2 text-xs text-red-400 text-center">{error}</p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-6 pb-6 flex items-center justify-center gap-3 shrink-0 flex-1">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <p className="text-sm text-indigo-300 font-medium">Analysing with AI…</p>
        </div>
      )}

      {/* Results */}
      {analysis && expanded && (
        <div className="px-6 pb-6 space-y-5 overflow-y-auto flex-1">
          {/* Verdict chip */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-semibold shadow-sm ${verdict.cls}`}>
            <span>{verdict.emoji}</span> {verdict.label}
          </div>

          {/* Price */}
          <Section icon={<TrendingUp className="w-3.5 h-3.5" />} title="Price Assessment">
            <p className="text-sm text-slate-300">{analysis.priceAssessment}</p>
          </Section>

          {/* Pros */}
          {analysis.pros?.length > 0 && (
            <Section icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />} title="Pros">
              <ul className="space-y-1.5">
                {analysis.pros.map((p, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>{p}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Cons */}
          {analysis.cons?.length > 0 && (
            <Section icon={<AlertCircle className="w-3.5 h-3.5 text-amber-400" />} title="Cons">
              <ul className="space-y-1.5">
                {analysis.cons.map((c, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                    <span className="text-amber-400 mt-0.5 shrink-0">–</span>{c}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Red Flags */}
          {analysis.redFlags?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Red Flags
              </p>
              <ul className="space-y-1.5">
                {analysis.redFlags.map((f, i) => (
                  <li key={i} className="text-sm text-red-200 flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0 text-red-400">⚠</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Neighbourhood */}
          {analysis.neighborhoodSummary && (
            <Section title="📍 Neighbourhood" icon={<></>}>
              <p className="text-sm text-slate-300">{analysis.neighborhoodSummary}</p>
            </Section>
          )}

          {/* Buyer Tips */}
          {analysis.buyerTips && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Buyer Tips</p>
              <p className="text-sm text-indigo-200">{analysis.buyerTips}</p>
            </div>
          )}

          <button
            onClick={run}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors mt-2"
          >
            <RefreshCw className="w-3 h-3" /> Re-analyse
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        {icon}{title}
      </p>
      {children}
    </div>
  );
}