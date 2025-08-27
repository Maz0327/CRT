import React from "react";
import { useCreateGroup, useAddToGroup, useAnalyzeGroup, useTruthCheck } from "../../hooks/useGroupAnalysis";
import TruthResult from "../truth/TruthResult";

type Props = {
  selectedCaptureIds: string[];
  projectId?: string | null;
};

export default function AnalyzeTogetherBar({ selectedCaptureIds, projectId }: Props) {
  const [groupId, setGroupId] = React.useState<string | null>(null);

  const createGroup = useCreateGroup();
  const addToGroup = useAddToGroup();
  const analyzeGroup = useAnalyzeGroup();
  const truth = useTruthCheck(groupId || undefined);

  async function onAnalyze() {
    if (!selectedCaptureIds?.length) return;

    const groupName = `Group ${new Date().toLocaleString()}`;
    const g = await createGroup.mutateAsync({ name: groupName, projectId: projectId ?? null });
    setGroupId(g.id);

    for (const id of selectedCaptureIds) {
      await addToGroup.mutateAsync({ groupId: g.id, captureId: id });
    }
    await analyzeGroup.mutateAsync(g.id);
  }

  return (
    <div className="border rounded-2xl p-4 bg-background/70 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          {selectedCaptureIds.length
            ? `${selectedCaptureIds.length} selected`
            : "Select captures to analyze together"}
        </div>
        <button
          className="px-3 py-2 rounded-lg border hover:bg-foreground/5"
          disabled={!selectedCaptureIds.length || createGroup.isPending || addToGroup.isPending || analyzeGroup.isPending}
          onClick={onAnalyze}
        >
          {createGroup.isPending || addToGroup.isPending || analyzeGroup.isPending ? "Queuing…" : "Analyze Together"}
        </button>
      </div>

      {groupId && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Group: {groupId} — Status: {truth.data?.status || (truth.isLoading ? "loading…" : "unknown")}
          </div>
          <TruthResult
            result={truth.data?.result as any}
            isLoading={truth.isLoading || (truth.data?.status !== "complete" && truth.data?.status !== "error")}
            error={truth.data?.status === "error" ? (truth.data?.error || "error") : undefined}
          />
        </div>
      )}
    </div>
  );
}