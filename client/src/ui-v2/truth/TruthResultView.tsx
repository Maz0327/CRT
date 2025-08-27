import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTruthCheck } from "../hooks/useTruthCheck";
import type { TruthChain } from "../types/truth";

function Section({
  label,
  value,
  show,
}: {
  label: string;
  value?: string;
  show: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur"
        >
          <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
          <div className="mt-2 text-base leading-relaxed">
            {value || <span className="text-white/40">—</span>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function TruthResultView({ id }: { id: string }) {
  const { data, loading, err, reveal, chain, confidence } = useTruthCheck(id);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
        <div className="text-red-300 font-medium">Failed to load analysis</div>
        <div className="text-red-200/80 text-sm mt-1">{err}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
        <div className="text-yellow-300">No data</div>
      </div>
    );
  }

  const title = data.check.title || "Truth Analysis";
  const why = data.check.result?.why_this_surfaced;
  const cohorts = data.check.result?.cohorts || [];
  const moves = data.check.result?.strategic_moves || [];
  const evidence = data.evidence || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {why && <p className="text-white/70 text-sm mt-1">Why this surfaced: {why}</p>}
        </div>
        {typeof confidence === "number" && (
          <div className="shrink-0 text-right">
            <div className="text-xs uppercase tracking-wide text-white/60">Confidence</div>
            <div className="text-lg font-semibold">{Math.round(confidence * 100)}%</div>
          </div>
        )}
      </div>

      {/* Truth Chain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section label="Fact" value={chain?.fact} show={reveal.showFact} />
        <Section label="Observation" value={chain?.observation} show={reveal.showObservation} />
        <Section label="Insight" value={chain?.insight} show={reveal.showInsight} />
        <Section label="Human Truth" value={chain?.human_truth} show={reveal.showHumanTruth} />
        <Section
          label="Cultural Moment"
          value={chain?.cultural_moment}
          show={reveal.showCulturalMoment}
        />
      </div>

      {/* Cohorts / Strategic Moves */}
      {(cohorts.length > 0 || moves.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cohorts.length > 0 && (
            <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
              <div className="text-xs uppercase tracking-wide text-white/60">Cohorts</div>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {cohorts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {moves.length > 0 && (
            <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
              <div className="text-xs uppercase tracking-wide text-white/60">
                Strategic Moves
              </div>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {moves.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Evidence */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <div className="text-xs uppercase tracking-wide text-white/60">Receipts</div>
        {evidence.length === 0 ? (
          <div className="mt-2 text-white/60 text-sm">No evidence captured.</div>
        ) : (
          <ul className="mt-2 space-y-2">
            {evidence.map((e) => (
              <li key={e.id} className="text-sm">
                {e.quote && <div className="italic">&ldquo;{e.quote}&rdquo;</div>}
                <div className="text-white/70">
                  {e.source ? `${e.source} — ` : ""}
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noreferrer" className="underline">
                      {e.url}
                    </a>
                  ) : (
                    "No URL"
                  )}
                  {e.event_timestamp ? ` • ${e.event_timestamp}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}