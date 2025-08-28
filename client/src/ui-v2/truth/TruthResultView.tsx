import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Edit3 } from "lucide-react";
import { useTruthCheck } from "../hooks/useTruthCheck";
import { reviewTruthCheck } from "../services/truth";
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
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showNeedEditForm, setShowNeedEditForm] = useState(false);
  const [editNote, setEditNote] = useState("");

  const handleReview = async (status: 'confirmed' | 'needs_edit', note?: string) => {
    setReviewLoading(true);
    try {
      await reviewTruthCheck(id, { status, note });
      // Force refresh the data by reloading the page or using a query refetch
      window.location.reload();
    } catch (error) {
      console.error('Review failed:', error);
      alert('Failed to review. Please try again.');
    } finally {
      setReviewLoading(false);
      setShowNeedEditForm(false);
      setEditNote("");
    }
  };

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
  const reviewStatus = (data.check as any).review_status || 'unreviewed';

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

      {/* Review Actions */}
      {reviewStatus === 'unreviewed' && (
        <div className="rounded-2xl p-4 bg-purple-500/10 border border-purple-400/30">
          <div className="text-xs uppercase tracking-wide text-purple-300 mb-3">Review Required</div>
          <div className="flex gap-3">
            <button
              onClick={() => handleReview('confirmed')}
              disabled={reviewLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {reviewLoading ? 'Confirming...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowNeedEditForm(true)}
              disabled={reviewLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit3 className="w-4 h-4" />
              Needs Edit
            </button>
          </div>
          
          {showNeedEditForm && (
            <div className="mt-4 space-y-3">
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="What needs to be edited? (optional)"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleReview('needs_edit', editNote)}
                  disabled={reviewLoading}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowNeedEditForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Status Display */}
      {reviewStatus !== 'unreviewed' && (
        <div className={`rounded-2xl p-4 border ${
          reviewStatus === 'confirmed' 
            ? 'bg-green-500/10 border-green-400/30' 
            : 'bg-orange-500/10 border-orange-400/30'
        }`}>
          <div className="text-xs uppercase tracking-wide text-white/60 mb-1">Status</div>
          <div className={`font-medium ${
            reviewStatus === 'confirmed' ? 'text-green-300' : 'text-orange-300'
          }`}>
            {reviewStatus === 'confirmed' ? 'Confirmed' : 'Needs Edit'}
          </div>
          {(data.check as any).review_note && (
            <div className="mt-2 text-sm text-white/70">
              Note: {(data.check as any).review_note}
            </div>
          )}
        </div>
      )}

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