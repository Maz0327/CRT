import { useEffect, useMemo, useState } from "react";
import { fetchTruthCheck } from "../services/truth";
import type { TruthCheckPayload, TruthChain } from "../types/truth";

type RevealState = {
  showFact: boolean;
  showObservation: boolean;
  showInsight: boolean;
  showHumanTruth: boolean;
  showCulturalMoment: boolean;
};

export function useTruthCheck(id: string) {
  const [data, setData] = useState<TruthCheckPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [reveal, setReveal] = useState<RevealState>({
    showFact: false,
    showObservation: false,
    showInsight: false,
    showHumanTruth: false,
    showCulturalMoment: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const payload = await fetchTruthCheck(id);
        if (cancelled) return;
        setData(payload);
        setLoading(false);

        // Progressive reveal timeline (visual "typing" feel)
        const t0 = setTimeout(() => setReveal((r) => ({ ...r, showFact: true })), 200);
        const t1 = setTimeout(() => setReveal((r) => ({ ...r, showObservation: true })), 700);
        const t2 = setTimeout(() => setReveal((r) => ({ ...r, showInsight: true })), 1200);
        const t3 = setTimeout(() => setReveal((r) => ({ ...r, showHumanTruth: true })), 1700);
        const t4 = setTimeout(() => setReveal((r) => ({ ...r, showCulturalMoment: true })), 2200);

        return () => {
          clearTimeout(t0);
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          clearTimeout(t4);
        };
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.message || "Failed to load");
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const chain: TruthChain | undefined = useMemo(
    () => data?.check?.result?.truth_chain,
    [data]
  );

  const confidence: number | undefined =
    data?.check?.result?.confidence ?? (data?.check?.confidence ?? undefined) ?? undefined;

  return { data, loading, err, reveal, chain, confidence };
}