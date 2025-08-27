import { listCaptures, updateCaptureStatus, type Capture } from "../services/captures";
import { useProjectContext } from "../context/ProjectContext";
import { useEffect, useState, useCallback } from "react";

export default function CapturesInboxPage() {
  const { currentProjectId } = useProjectContext();
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"new" | "keep" | "trash" | "all">("new");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentProjectId) {
      setCaptures([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const list = await listCaptures(statusFilter === "all" ? undefined : { status: statusFilter });
      setCaptures(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load captures");
      setCaptures([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectId, statusFilter]);

  useEffect(() => { void load(); }, [load]);

  const onUpdateStatus = async (id: string, status: "new" | "keep" | "trash") => {
    try {
      await updateCaptureStatus(id, status);
      // optimistic: update local list
      setCaptures(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="new">New</option>
          <option value="keep">Keep</option>
          <option value="trash">Trash</option>
          <option value="all">All</option>
        </select>
        <button className="border rounded px-2 py-1" onClick={() => load()} disabled={isLoading}>
          Refresh
        </button>
      </div>

      {isLoading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!isLoading && captures.length === 0 && <div>No captures.</div>}

      <ul className="space-y-2">
        {captures.map(c => (
          <li key={c.id} className="border rounded p-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-medium truncate">{c.title || c.url || "Untitled"}</div>
              {c.url && (
                <a className="text-sm underline break-all" href={c.url} target="_blank" rel="noreferrer">
                  {c.url}
                </a>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {new Date(c.created_at).toLocaleString()} • status: {c.status}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => onUpdateStatus(c.id, "new")}>
                Mark New
              </button>
              <button className="px-2 py-1 border rounded" onClick={() => onUpdateStatus(c.id, "keep")}>
                Keep
              </button>
              <button className="px-2 py-1 border rounded" onClick={() => onUpdateStatus(c.id, "trash")}>
                Trash
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}