import { useEffect, useRef } from 'react';
import { useCanvasStore } from './useCanvasStore';
import { useBrief } from '../hooks/useBrief';

const AUTOSAVE_DELAY = 800; // ms
const DRAFT_KEY_PREFIX = 'brief-draft-';

export function useAutosave(briefId: string | undefined) {
  const { brief, isDirty, setDirty, setLastSaved } = useCanvasStore();
  const { saveBrief, isSaving } = useBrief(briefId || '');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  // Save to localStorage as draft
  const saveDraft = (briefData: any) => {
    try {
      localStorage.setItem(
        `${DRAFT_KEY_PREFIX}${briefId}`,
        JSON.stringify({
          data: briefData,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Failed to save draft to localStorage:', error);
    }
  };

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem(`${DRAFT_KEY_PREFIX}${briefId}`);
      if (draftData) {
        const parsed = JSON.parse(draftData);
        return {
          data: parsed.data,
          timestamp: parsed.timestamp,
        };
      }
    } catch (error) {
      console.warn('Failed to load draft from localStorage:', error);
    }
    return null;
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(`${DRAFT_KEY_PREFIX}${briefId}`);
    } catch (error) {
      console.warn('Failed to clear draft from localStorage:', error);
    }
  };

  // Autosave effect
  useEffect(() => {
    if (!brief || !isDirty || isSaving || !briefId) return;

    const briefString = JSON.stringify(brief);
    if (briefString === lastSavedRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Save draft immediately
    saveDraft(brief);

    // Schedule server save
    timeoutRef.current = setTimeout(() => {
      saveBrief(brief);
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [brief, isDirty, isSaving, saveBrief, setDirty, setLastSaved]);

  // Handle save success/error
  useEffect(() => {
    if (!isSaving && brief) {
      const briefString = JSON.stringify(brief);
      if (briefString !== lastSavedRef.current) {
        setDirty(false);
        setLastSaved(new Date());
        clearDraft();
        lastSavedRef.current = briefString;
      }
    }
  }, [isSaving, brief, setDirty, setLastSaved]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadDraft,
    clearDraft,
    saveDraft,
  };
}

// Hook to handle draft restoration
export function useDraftRestore(briefId: string | undefined) {
  const { setBrief } = useCanvasStore();
  const { brief: serverBrief } = useBrief(briefId || '');

  const checkForDraft = () => {
    if (!briefId) return { hasDraft: false };
    
    try {
      const draftData = localStorage.getItem(`${DRAFT_KEY_PREFIX}${briefId}`);
      if (draftData && serverBrief) {
        const parsed = JSON.parse(draftData);
        const draftTimestamp = parsed.timestamp;
        const serverTimestamp = new Date(serverBrief.updatedAt).getTime();

        // If draft is newer than server data, offer to restore
        if (draftTimestamp > serverTimestamp) {
          return {
            hasDraft: true,
            draftData: parsed.data,
            draftTimestamp,
            serverTimestamp,
          };
        }
      }
    } catch (error) {
      console.warn('Failed to check for draft:', error);
    }

    return { hasDraft: false };
  };

  const restoreDraft = (draftData: any) => {
    setBrief(draftData);
  };

  const discardDraft = () => {
    try {
      if (briefId) {
        localStorage.removeItem(`${DRAFT_KEY_PREFIX}${briefId}`);
      }
    } catch (error) {
      console.warn('Failed to discard draft:', error);
    }
  };

  return {
    checkForDraft,
    restoreDraft,
    discardDraft,
  };
}