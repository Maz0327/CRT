import { useEffect } from 'react';
import { useCanvasStore } from './useCanvasStore';

export function useCanvasKeyboard() {
  const {
    selectedBlockIds,
    deleteBlocks,
    duplicateBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
    toggleGrid,
    clearSelection,
  } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      switch (e.key) {
        case 'Backspace':
        case 'Delete':
          if (selectedBlockIds.length > 0) {
            e.preventDefault();
            deleteBlocks(selectedBlockIds);
          }
          break;

        case 'd':
          if (isMod && selectedBlockIds.length > 0) {
            e.preventDefault();
            duplicateBlocks(selectedBlockIds);
          }
          break;

        case 'z':
          if (isMod && !isShift && canUndo()) {
            e.preventDefault();
            undo();
          } else if (isMod && isShift && canRedo()) {
            e.preventDefault();
            redo();
          }
          break;

        case 'y':
          if (isMod && canRedo()) {
            e.preventDefault();
            redo();
          }
          break;

        case 'g':
          if (!isMod) {
            e.preventDefault();
            toggleGrid();
          }
          break;

        case 'Escape':
          e.preventDefault();
          clearSelection();
          break;

        case 'a':
          if (isMod) {
            e.preventDefault();
            // Select all blocks in current slide
            const { brief, currentSlideIndex } = useCanvasStore.getState();
            if (brief?.slides[currentSlideIndex]) {
              const allBlockIds = brief.slides[currentSlideIndex].blocks.map(b => b.id);
              useCanvasStore.getState().setSelectedBlockIds(allBlockIds);
            }
          }
          break;

        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          if (selectedBlockIds.length > 0) {
            e.preventDefault();
            const nudgeDistance = isShift ? 10 : 1;
            const deltaX = e.key === 'ArrowLeft' ? -nudgeDistance : e.key === 'ArrowRight' ? nudgeDistance : 0;
            const deltaY = e.key === 'ArrowUp' ? -nudgeDistance : e.key === 'ArrowDown' ? nudgeDistance : 0;

            selectedBlockIds.forEach(blockId => {
              const { brief, currentSlideIndex, updateBlock } = useCanvasStore.getState();
              const block = brief?.slides[currentSlideIndex]?.blocks.find(b => b.id === blockId);
              if (block) {
                updateBlock(blockId, {
                  x: Math.max(0, block.x + deltaX),
                  y: Math.max(0, block.y + deltaY),
                });
              }
            });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockIds, deleteBlocks, duplicateBlocks, undo, redo, canUndo, canRedo, toggleGrid, clearSelection]);

  // Prevent default browser shortcuts that might interfere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      // Prevent browser save dialog
      if (isMod && e.key === 's') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}