import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { SlideList } from './SlideList';
import { SlideViewport } from './SlideViewport';
import { CanvasToolbar } from './CanvasToolbar';
import { useCanvasStore } from './useCanvasStore';
import { useCanvasKeyboard } from './keyboard';
import { useAutosave, useDraftRestore } from './autosave';
import { useBrief } from '../hooks/useBrief';
import { AlertTriangle, Clock } from 'lucide-react';

export function CanvasHost() {
  const { id } = useParams<{ id: string }>();
  const { brief: serverBrief, isLoading } = useBrief(id || '');
  const { brief, setBrief, isDirty, lastSaved } = useCanvasStore();
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [draftInfo, setDraftInfo] = useState<any>(null);

  const { checkForDraft, restoreDraft, discardDraft } = useDraftRestore(id);
  useAutosave(id);
  useCanvasKeyboard();

  // Initialize brief when server data loads
  useEffect(() => {
    if (serverBrief && !brief) {
      setBrief(serverBrief);
      
      // Check for draft after setting server data
      const draft = checkForDraft();
      if (draft.hasDraft) {
        setDraftInfo(draft);
        setShowDraftRestore(true);
      }
    }
  }, [serverBrief, brief, setBrief, checkForDraft]);

  // Prevent navigation when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 glass-border border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-ink/70">Loading brief...</p>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Brief Not Found</h2>
          <p className="text-ink/70">The brief you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col glass-canvas overflow-hidden">
      {/* Header */}
      <div className="glass-header h-14 md:h-16 px-3 md:px-6 flex items-center justify-between glass-border-b gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <h1 className="text-sm md:text-lg font-semibold truncate max-w-[150px] md:max-w-none">{brief.title}</h1>
          <div className="hidden md:flex items-center gap-2 text-sm text-ink/60">
            <Clock className="w-4 h-4" />
            {isDirty ? (
              <span>Unsaved changes</span>
            ) : lastSaved ? (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            ) : (
              <span>All changes saved</span>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <CanvasToolbar />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide List */}
        <div className="w-12 md:w-16 lg:w-64 glass glass-border-r flex flex-col flex-shrink-0">
          <SlideList />
        </div>

        {/* Viewport */}
        <div className="flex-1 relative overflow-hidden">
          <SlideViewport />
        </div>

        {/* Properties Panel */}
        <div className="hidden xl:flex w-80 glass glass-border-l flex-col flex-shrink-0">
          <div className="p-3 md:p-4 glass-border-b">
            <h3 className="font-medium mb-4">Properties</h3>
            {/* Properties content will be added here */}
            <div className="text-sm text-ink/50">
              Select a block to edit properties
            </div>
          </div>
        </div>
      </div>

      {/* Draft Restore Modal */}
      <AnimatePresence>
        {showDraftRestore && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold">Restore Draft?</h3>
              </div>
              
              <p className="text-ink/70 mb-6">
                We found a more recent draft of this brief saved locally. 
                Would you like to restore it?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    discardDraft();
                    setShowDraftRestore(false);
                  }}
                  className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                >
                  Discard Draft
                </button>
                <button
                  onClick={() => {
                    restoreDraft(draftInfo.draftData);
                    setShowDraftRestore(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Restore Draft
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}