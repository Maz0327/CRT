import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { extractSource, analyzeText as legacyAnalyzeText, analyzeVisual, type TruthCheck, analyzeText, getTriageList, reviewTruthCheck } from "../services/truth";
import { useProjectContext } from "../app/providers";
import { useLocation } from "wouter";
import { Filter, AlertTriangle, CheckCircle, Edit3 } from "lucide-react";

type Tab = "url" | "text" | "visual" | "triage";
type ReviewFilter = "all" | "unreviewed" | "confirmed" | "needs_edit";

export function TruthLabPage() {
  const { currentProjectId } = useProjectContext();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [check, setCheck] = useState<TruthCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");

  // Triage list query
  const { data: triageData, isLoading: triageLoading, refetch: refetchTriage } = useQuery({
    queryKey: ['triage', currentProjectId],
    queryFn: () => currentProjectId ? getTriageList(currentProjectId, { limit: 50 }) : Promise.resolve({ items: [] }),
    enabled: !!currentProjectId && tab === 'triage',
    refetchInterval: 30000, // Refresh every 30 seconds when active
  });

  const mExtract = useMutation({
    mutationFn: async () => {
      setError(null);
      const body: any = { projectId: currentProjectId || undefined };
      if (tab === "url") body.url = url;
      if (tab === "text") body.text = text;
      if (tab === "visual") body.imagePath = imageUrl;
      const resp = await extractSource(body);
      // setCheck(resp.check); // disabled for new flow
      return resp;
    }
  });

  const mText = useMutation({
    mutationFn: async (quick: boolean) => {
      if (!check?.id) throw new Error("no check");
      const resp = await legacyAnalyzeText(check.id);
      // setCheck(resp.check); // disabled for new flow
      return resp;
    }
  });

  const mVisual = useMutation({
    mutationFn: async (quick: boolean) => {
      if (!check?.id) throw new Error("no check");
      const resp = await analyzeVisual(check.id);
      // setCheck(resp.check); // disabled for new flow
      return resp;
    }
  });

  async function onAnalyze(text: string, title?: string, projectId?: string) {
    setSubmitting(true);
    try {
      const { truthCheckId } = await analyzeText({ text, title, projectId });
      navigate(`/truth/check/${truthCheckId}`);
    } catch (e: any) {
      setError(e?.message || "Failed to start analysis");
    } finally {
      setSubmitting(false);
    }
  }

  // Review mutation for triage items
  const reviewMutation = useMutation({
    mutationFn: async ({ checkId, status, note }: { checkId: string; status: 'confirmed' | 'needs_edit'; note?: string }) => {
      return reviewTruthCheck(checkId, { status, note });
    },
    onSuccess: () => {
      refetchTriage(); // Refresh the triage list
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Truth Lab</h1>

      {/* Review Filter */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Review Status Filter</span>
        </div>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-2 rounded text-sm ${reviewFilter==='all'?'bg-white/20':'bg-white/10'}`} 
            onClick={()=>setReviewFilter("all")}
          >
            All Items
          </button>
          <button 
            className={`px-3 py-2 rounded text-sm ${reviewFilter==='unreviewed'?'bg-purple-600/50':'bg-white/10'}`} 
            onClick={()=>setReviewFilter("unreviewed")}
          >
            Needs Review
          </button>
          <button 
            className={`px-3 py-2 rounded text-sm ${reviewFilter==='confirmed'?'bg-green-600/50':'bg-white/10'}`} 
            onClick={()=>setReviewFilter("confirmed")}
          >
            Confirmed
          </button>
          <button 
            className={`px-3 py-2 rounded text-sm ${reviewFilter==='needs_edit'?'bg-orange-600/50':'bg-white/10'}`} 
            onClick={()=>setReviewFilter("needs_edit")}
          >
            Needs Edit
          </button>
        </div>
        {reviewFilter !== 'all' && (
          <div className="mt-2 text-xs text-white/70">
            Showing items with status: {reviewFilter.replace('_', ' ')}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <button className={`px-3 py-2 rounded ${tab==='url'?'bg-white/20':'bg-white/10'}`} onClick={()=>setTab("url")}>URL Extract</button>
        <button className={`px-3 py-2 rounded ${tab==='text'?'bg-white/20':'bg-white/10'}`} onClick={()=>setTab("text")}>Text Analysis</button>
        <button className={`px-3 py-2 rounded ${tab==='visual'?'bg-white/20':'bg-white/10'}`} onClick={()=>setTab("visual")}>Visual Check</button>
        <button 
          className={`px-3 py-2 rounded flex items-center gap-2 ${tab==='triage'?'bg-orange-600/50':'bg-white/10'}`} 
          onClick={()=>setTab("triage")}
        >
          <AlertTriangle className="w-4 h-4" />
          Needs Review
          {triageData?.items && triageData.items.length > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px]">
              {triageData.items.length}
            </span>
          )}
        </button>
      </div>

      {tab === "url" && (
        <div className="glass-card p-4">
          <label className="block text-sm mb-2">Source URL</label>
          <input className="w-full p-2 rounded bg-white/5 border border-white/10" placeholder="https://example.com/post" value={url} onChange={e=>setUrl(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded bg-blue-600" disabled={mExtract.isPending} onClick={()=>mExtract.mutate()}>
              {mExtract.isPending? "Extracting…" : "Extract"}
            </button>
          </div>
        </div>
      )}

      {tab === "text" && (
        <div className="glass-card p-4">
          <label className="block text-sm mb-2">Paste text</label>
          <textarea className="w-full p-2 h-40 rounded bg-white/5 border border-white/10" value={text} onChange={e=>setText(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded bg-blue-600" disabled={submitting || !text.trim()} onClick={()=>onAnalyze(text, undefined, currentProjectId)}>
              {submitting ? "Analyzing..." : "Analyze"}
            </button>
            <button className="px-3 py-2 rounded bg-white/10" disabled={mExtract.isPending} onClick={()=>mExtract.mutate()}>
              {mExtract.isPending? "Save Text" : "Save Text (Legacy)"}
            </button>
          </div>
        </div>
      )}

      {tab === "visual" && (
        <div className="glass-card p-4">
          <label className="block text-sm mb-2">Image URL</label>
          <input className="w-full p-2 rounded bg-white/5 border border-white/10" placeholder="https://..." value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded bg-blue-600" disabled={mExtract.isPending} onClick={()=>mExtract.mutate()}>
              {mExtract.isPending? "Save" : "Save"}
            </button>
          </div>
        </div>
      )}

      {tab === "triage" && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold">Needs Review Queue</h2>
            {triageData?.items && (
              <span className="text-sm text-white/70">
                ({triageData.items.length} items)
              </span>
            )}
          </div>

          {triageLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/10 rounded-lg h-24" />
              ))}
            </div>
          ) : triageData?.items && triageData.items.length > 0 ? (
            <div className="space-y-4">
              {triageData.items.map((item) => (
                <TriageItem 
                  key={item.id} 
                  item={item} 
                  onReview={(status, note) => reviewMutation.mutate({ checkId: item.id, status, note })}
                  isReviewing={reviewMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items need review at this time.</p>
              <p className="text-sm mt-1">Great work keeping up with quality control!</p>
            </div>
          )}
        </div>
      )}

      {error && <div className="mt-4 text-red-400">{error}</div>}

      {check && (
        <div className="mt-6 space-y-4">
          <div className="glass-card p-4">
            <h2 className="font-semibold mb-2">Extracted</h2>
            {check.extracted_text ? <p className="text-sm whitespace-pre-wrap">{check.extracted_text.slice(0, 1200)}</p> : <p className="text-sm opacity-70">No extracted text</p>}
            {Array.isArray(check.extracted_images) && check.extracted_images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">{check.extracted_images.slice(0,6).map((src,i)=>(<img key={i} src={src} className="rounded border border-white/10" />))}</div>
            )}
          </div>

          <div className="glass-card p-4">
            <h2 className="font-semibold mb-2">Text Analysis</h2>
            <div className="flex gap-2 mb-3">
              <button className="px-3 py-2 rounded bg-white/10" disabled={mText.isPending} onClick={()=>mText.mutate(true)}>{mText.isPending ? "Running…" : "Quick"}</button>
              <button className="px-3 py-2 rounded bg-white/10" disabled={mText.isPending} onClick={()=>mText.mutate(false)}>{mText.isPending ? "Running…" : "Deep"}</button>
            </div>
            <pre className="text-xs bg-black/30 p-3 rounded overflow-auto">{JSON.stringify({
              result_truth: check.result_truth,
              result_strategic: check.result_strategic,
              result_cohorts: check.result_cohorts
            }, null, 2)}</pre>
          </div>

          <div className="glass-card p-4">
            <h2 className="font-semibold mb-2">Visual Check</h2>
            <div className="flex gap-2 mb-3">
              <button className="px-3 py-2 rounded bg-white/10" disabled={mVisual.isPending} onClick={()=>mVisual.mutate(true)}>{mVisual.isPending ? "Running…" : "Quick"}</button>
              <button className="px-3 py-2 rounded bg-white/10" disabled={mVisual.isPending} onClick={()=>mVisual.mutate(false)}>{mVisual.isPending ? "Running…" : "Deep"}</button>
            </div>
            <pre className="text-xs bg-black/30 p-3 rounded overflow-auto">{JSON.stringify(check.result_visual, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Triage Item Component
function TriageItem({ 
  item, 
  onReview, 
  isReviewing 
}: { 
  item: any; 
  onReview: (status: 'confirmed' | 'needs_edit', note?: string) => void;
  isReviewing: boolean;
}) {
  const [showNeedEditForm, setShowNeedEditForm] = useState(false);
  const [editNote, setEditNote] = useState("");

  const handleConfirm = () => {
    onReview('confirmed');
  };

  const handleNeedsEdit = () => {
    if (showNeedEditForm) {
      onReview('needs_edit', editNote);
      setShowNeedEditForm(false);
      setEditNote("");
    } else {
      setShowNeedEditForm(true);
    }
  };

  const isUnreviewed = item.review_status === 'unreviewed' || !item.review_status;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isUnreviewed ? 'ring-2 ring-purple-400/60 bg-purple-500/5 border-purple-400/30' : 'border-white/10 bg-white/5'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-white">{item.title || 'Untitled Analysis'}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
            <span>Confidence: {Math.round((item.model_confidence || 0) * 100)}%</span>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.triage_reasons && item.triage_reasons.length > 0 && (
            <div className="flex gap-1">
              {item.triage_reasons.map((reason: string, idx: number) => (
                <span 
                  key={idx}
                  className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded"
                >
                  {reason.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview of analysis */}
      {item.result && (
        <div className="mb-3 p-3 bg-white/5 rounded-lg text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-white/60">Fact:</span>
              <p className="text-white/90 mt-1">{item.result.fact?.slice(0, 100) || 'N/A'}...</p>
            </div>
            <div>
              <span className="text-white/60">Insight:</span>
              <p className="text-white/90 mt-1">{item.result.insight?.slice(0, 100) || 'N/A'}...</p>
            </div>
          </div>
        </div>
      )}

      {/* Review Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={isReviewing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          {isReviewing ? 'Confirming...' : 'Confirm'}
        </button>
        <button
          onClick={handleNeedsEdit}
          disabled={isReviewing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
        >
          <Edit3 className="w-4 h-4" />
          Needs Edit
        </button>
      </div>

      {showNeedEditForm && (
        <div className="mt-3 space-y-3">
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="What needs to be edited? (optional)"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleNeedsEdit}
              disabled={isReviewing}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              Submit
            </button>
            <button
              onClick={() => setShowNeedEditForm(false)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}