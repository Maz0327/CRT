import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCanvasStore } from './useCanvasStore';
import { BlockText } from './BlockText';
import { BlockImage } from './BlockImage';
import { BlockNote } from './BlockNote';
import { findSnapLines, applySnapping, SnapLine } from './layout';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export function SlideViewport() {
  const {
    brief,
    currentSlideIndex,
    zoom,
    panX,
    panY,
    showGrid,
    selectedBlockIds,
    selectBlock,
    clearSelection,
    updateBlock,
  } = useCanvasStore();

  const viewportRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);

  const currentSlide = brief?.slides[currentSlideIndex];

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  const handleBlockDragStart = useCallback((blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!selectedBlockIds.includes(blockId)) {
      selectBlock(blockId, e.metaKey || e.ctrlKey);
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [selectedBlockIds, selectBlock]);

  const handleBlockDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !currentSlide) return;

    const deltaX = (e.clientX - dragStart.x) / zoom;
    const deltaY = (e.clientY - dragStart.y) / zoom;

    // Get all blocks except the ones being dragged for snap calculation
    const otherBlocks = currentSlide.blocks
      .filter(block => !selectedBlockIds.includes(block.id))
      .map(block => ({ x: block.x, y: block.y, w: block.w, h: block.h }));

    selectedBlockIds.forEach(blockId => {
      const block = currentSlide.blocks.find(b => b.id === blockId);
      if (block) {
        const newRect = {
          x: Math.max(0, block.x + deltaX),
          y: Math.max(0, block.y + deltaY),
          w: block.w,
          h: block.h,
        };

        // Find snap lines for this block
        const blockSnapLines = findSnapLines(newRect, otherBlocks);
        
        // Apply snapping
        const snappedRect = applySnapping(newRect, blockSnapLines);
        
        updateBlock(blockId, {
          x: snappedRect.x,
          y: snappedRect.y,
        });

        // Update snap lines for visual feedback
        setSnapLines(blockSnapLines);
      }
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, zoom, currentSlide, selectedBlockIds, updateBlock]);

  const handleBlockDragEnd = useCallback(() => {
    setIsDragging(false);
    setSnapLines([]);
  }, []);

  if (!currentSlide) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-ink/50">No slide selected</div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className="flex-1 overflow-hidden relative glass-canvas canvas-mobile"
      onMouseMove={handleBlockDrag}
      onMouseUp={handleBlockDragEnd}
      onMouseLeave={handleBlockDragEnd}
      onTouchMove={(e) => {
        // Convert touch to mouse event for mobile drag support
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          handleBlockDrag({
            clientX: touch.clientX,
            clientY: touch.clientY,
          } as React.MouseEvent);
        }
      }}
      onTouchEnd={handleBlockDragEnd}
    >
      {/* Canvas */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center overflow-auto md:overflow-hidden"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        }}
      >
        <div
          className={cn(
            'relative frost-card rounded-lg glass-shadow',
            showGrid && 'canvas-grid',
            'min-w-[320px] md:min-w-[800px]' // Ensure minimum width on mobile
          )}
          style={{
            width: Math.max(320, CANVAS_WIDTH * (window.innerWidth < 768 ? 0.8 : 1)),
            height: Math.max(240, CANVAS_HEIGHT * (window.innerWidth < 768 ? 0.8 : 1)),
          }}
          onClick={handleCanvasClick}
        >
          {/* Blocks */}
          {currentSlide.blocks.map((block) => {
            const isSelected = selectedBlockIds.includes(block.id);
            
            return (
              <div
                key={block.id}
                className={cn(
                  'absolute cursor-move touch-target',
                  isSelected && 'ring-2 glass-border ring-offset-2'
                )}
                style={{
                  left: block.x,
                  top: block.y,
                  width: block.w,
                  height: block.h,
                  transform: block.rotation ? `rotate(${block.rotation}deg)` : undefined,
                }}
                onMouseDown={(e) => handleBlockDragStart(block.id, e)}
                onTouchStart={(e) => {
                  // Convert touch to mouse event for mobile
                  if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    handleBlockDragStart(block.id, {
                      clientX: touch.clientX,
                      clientY: touch.clientY,
                      stopPropagation: () => e.stopPropagation(),
                      metaKey: false,
                      ctrlKey: false,
                    } as React.MouseEvent);
                  }
                }}
              >
                {block.type === 'text' && <BlockText block={block as any} />}
                {block.type === 'image' && <BlockImage block={block as any} />}
                {block.type === 'note' && <BlockNote block={block as any} />}
                
                {/* Selection handles */}
                {isSelected && (
                  <>
                    {/* Corner handles for resizing */}
                    <div className="absolute -top-1 -left-1 w-3 md:w-2 h-3 md:h-2 frost-strong rounded-full cursor-nw-resize touch-target" />
                    <div className="absolute -top-1 -right-1 w-3 md:w-2 h-3 md:h-2 frost-strong rounded-full cursor-ne-resize touch-target" />
                    <div className="absolute -bottom-1 -left-1 w-3 md:w-2 h-3 md:h-2 frost-strong rounded-full cursor-sw-resize touch-target" />
                    <div className="absolute -bottom-1 -right-1 w-3 md:w-2 h-3 md:h-2 frost-strong rounded-full cursor-se-resize touch-target" />
                    
                    {/* Edge handles */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 md:w-2 h-3 md:h-2 frost-strong rounded-full cursor-n-resize touch-target" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 md:w-2 h-3 md:h-2 frost-strong rounded-full cursor-s-resize touch-target" />
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 md:w-2 h-3 md:h-2 frost-strong rounded-full cursor-w-resize touch-target" />
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 md:w-2 h-3 md:h-2 frost-strong rounded-full cursor-e-resize touch-target" />
                  </>
                )}
              </div>
            );
          })}

          {/* Snap lines */}
          {snapLines.map((line, index) => (
            <div
              key={index}
              className={cn(
                'snap-line',
                line.type === 'horizontal' ? 'snap-line-h' : 'snap-line-v'
              )}
              style={{
                [line.type === 'horizontal' ? 'top' : 'left']: line.position,
                [line.type === 'horizontal' ? 'left' : 'top']: line.start,
                [line.type === 'horizontal' ? 'width' : 'height']: line.end - line.start,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Zoom indicator */}
      <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 glass rounded-lg px-2 md:px-3 py-1 text-xs md:text-sm">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}