import React from "react";
import type { TruthLabResult } from "@/../../shared/truth-types";

type Props = { result?: TruthLabResult | null; isLoading?: boolean; error?: string | null };

export default function TruthResult({ result, isLoading, error }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 border bg-background/60 backdrop-blur">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-2/3 rounded bg-foreground/10" />
          <div className="h-4 w-1/2 rounded bg-foreground/10" />
          <div className="h-4 w-5/6 rounded bg-foreground/10" />
          <div className="h-4 w-4/6 rounded bg-foreground/10" />
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-600 text-sm">Error: {error}</div>;
  }
  if (!result) {
    return <div className="text-muted-foreground text-sm">No result yet.</div>;
  }

  const c = result.truth_chain;
  const pct = Math.round((result.confidence ?? 0) * 100);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 border bg-background/70 backdrop-blur">
        <h2 className="text-xl font-semibold">{result.headline}</h2>
        <p className="text-sm text-muted-foreground mt-2">{result.summary}</p>
        <div className="mt-4 h-2 w-full bg-foreground/10 rounded">
          <div
            className="h-2 bg-foreground/60 rounded"
            style={{ width: `${pct}%` }}
            aria-label={`Confidence ${pct}%`}
            title={`Confidence ${pct}%`}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChainCard title="Fact" body={c.fact} />
        <ChainCard title="Observation" body={c.observation} />
        <ChainCard title="Insight" body={c.insight} />
        <ChainCard title="Human Truth" body={c.human_truth} />
        <ChainCard title="Cultural Moment" body={c.cultural_moment} />
      </div>

      {!!result.cohorts?.length && (
        <div className="rounded-xl p-4 border">
          <h3 className="font-medium">Cohorts</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.cohorts.map((t, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded bg-foreground/10">{t}</span>
            ))}
          </div>
        </div>
      )}

      {!!result.strategic_moves?.length && (
        <div className="rounded-xl p-4 border">
          <h3 className="font-medium">Strategic Moves</h3>
          <ul className="mt-2 list-disc ml-5 space-y-1 text-sm">
            {result.strategic_moves.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {!!result.receipts?.length && (
        <div className="rounded-xl p-4 border">
          <h3 className="font-medium">Receipts</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {result.receipts.slice(0, 5).map((r, i) => (
              <li key={i}>
                <q>{r.quote}</q>
                {r.source ? <span className="text-muted-foreground"> — {r.source}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.why_this_surfaced && (
        <div className="rounded-xl p-4 border">
          <h3 className="font-medium">Why this surfaced</h3>
          <p className="text-sm mt-1">{result.why_this_surfaced}</p>
        </div>
      )}
    </div>
  );
}

function ChainCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl p-4 border bg-background/60">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm mt-1 leading-relaxed">{body}</p>
    </div>
  );
}