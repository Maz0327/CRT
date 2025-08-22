export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SnapLine {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}

const SNAP_THRESHOLD = 8;
const GRID_SIZE = 20;

export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapRectToGrid(rect: Rect, gridSize: number = GRID_SIZE): Rect {
  return {
    x: snapToGrid(rect.x, gridSize),
    y: snapToGrid(rect.y, gridSize),
    w: snapToGrid(rect.w, gridSize),
    h: snapToGrid(rect.h, gridSize),
  };
}

export function findSnapLines(
  movingRect: Rect,
  otherRects: Rect[],
  threshold: number = SNAP_THRESHOLD
): SnapLine[] {
  const snapLines: SnapLine[] = [];
  
  const movingEdges = {
    left: movingRect.x,
    right: movingRect.x + movingRect.w,
    top: movingRect.y,
    bottom: movingRect.y + movingRect.h,
    centerX: movingRect.x + movingRect.w / 2,
    centerY: movingRect.y + movingRect.h / 2,
  };

  otherRects.forEach(rect => {
    const otherEdges = {
      left: rect.x,
      right: rect.x + rect.w,
      top: rect.y,
      bottom: rect.y + rect.h,
      centerX: rect.x + rect.w / 2,
      centerY: rect.y + rect.h / 2,
    };

    // Vertical snap lines
    Object.entries(movingEdges).forEach(([movingEdge, movingPos]) => {
      if (movingEdge === 'top' || movingEdge === 'bottom' || movingEdge === 'centerY') return;
      
      Object.entries(otherEdges).forEach(([otherEdge, otherPos]) => {
        if (otherEdge === 'top' || otherEdge === 'bottom' || otherEdge === 'centerY') return;
        
        if (Math.abs(movingPos - otherPos) <= threshold) {
          snapLines.push({
            type: 'vertical',
            position: otherPos,
            start: Math.min(movingRect.y, rect.y),
            end: Math.max(movingRect.y + movingRect.h, rect.y + rect.h),
          });
        }
      });
    });

    // Horizontal snap lines
    Object.entries(movingEdges).forEach(([movingEdge, movingPos]) => {
      if (movingEdge === 'left' || movingEdge === 'right' || movingEdge === 'centerX') return;
      
      Object.entries(otherEdges).forEach(([otherEdge, otherPos]) => {
        if (otherEdge === 'left' || otherEdge === 'right' || otherEdge === 'centerX') return;
        
        if (Math.abs(movingPos - otherPos) <= threshold) {
          snapLines.push({
            type: 'horizontal',
            position: otherPos,
            start: Math.min(movingRect.x, rect.x),
            end: Math.max(movingRect.x + movingRect.w, rect.x + rect.w),
          });
        }
      });
    });
  });

  return snapLines;
}

export function applySnapping(
  rect: Rect,
  snapLines: SnapLine[],
  threshold: number = SNAP_THRESHOLD
): Rect {
  let snappedRect = { ...rect };

  snapLines.forEach(line => {
    if (line.type === 'vertical') {
      const leftDiff = Math.abs(rect.x - line.position);
      const rightDiff = Math.abs(rect.x + rect.w - line.position);
      const centerDiff = Math.abs(rect.x + rect.w / 2 - line.position);

      if (leftDiff <= threshold) {
        snappedRect.x = line.position;
      } else if (rightDiff <= threshold) {
        snappedRect.x = line.position - rect.w;
      } else if (centerDiff <= threshold) {
        snappedRect.x = line.position - rect.w / 2;
      }
    } else {
      const topDiff = Math.abs(rect.y - line.position);
      const bottomDiff = Math.abs(rect.y + rect.h - line.position);
      const centerDiff = Math.abs(rect.y + rect.h / 2 - line.position);

      if (topDiff <= threshold) {
        snappedRect.y = line.position;
      } else if (bottomDiff <= threshold) {
        snappedRect.y = line.position - rect.h;
      } else if (centerDiff <= threshold) {
        snappedRect.y = line.position - rect.h / 2;
      }
    }
  });

  return snappedRect;
}

export function alignBlocks(blocks: Rect[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): Rect[] {
  if (blocks.length < 2) return blocks;

  const bounds = blocks.reduce(
    (acc, block) => ({
      minX: Math.min(acc.minX, block.x),
      maxX: Math.max(acc.maxX, block.x + block.w),
      minY: Math.min(acc.minY, block.y),
      maxY: Math.max(acc.maxY, block.y + block.h),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );

  return blocks.map(block => {
    const aligned = { ...block };

    switch (alignment) {
      case 'left':
        aligned.x = bounds.minX;
        break;
      case 'center':
        aligned.x = (bounds.minX + bounds.maxX) / 2 - block.w / 2;
        break;
      case 'right':
        aligned.x = bounds.maxX - block.w;
        break;
      case 'top':
        aligned.y = bounds.minY;
        break;
      case 'middle':
        aligned.y = (bounds.minY + bounds.maxY) / 2 - block.h / 2;
        break;
      case 'bottom':
        aligned.y = bounds.maxY - block.h;
        break;
    }

    return aligned;
  });
}

export function distributeBlocks(blocks: Rect[], direction: 'horizontal' | 'vertical'): Rect[] {
  if (blocks.length < 3) return blocks;

  const sorted = [...blocks].sort((a, b) => 
    direction === 'horizontal' ? a.x - b.x : a.y - b.y
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  
  const totalSpace = direction === 'horizontal' 
    ? (last.x + last.w) - first.x
    : (last.y + last.h) - first.y;
    
  const totalBlockSize = sorted.reduce((sum, block) => 
    sum + (direction === 'horizontal' ? block.w : block.h), 0
  );
  
  const spacing = (totalSpace - totalBlockSize) / (sorted.length - 1);

  let currentPos = direction === 'horizontal' ? first.x : first.y;

  return sorted.map((block, index) => {
    if (index === 0) return block;
    
    const distributed = { ...block };
    
    if (direction === 'horizontal') {
      distributed.x = currentPos;
      currentPos += block.w + spacing;
    } else {
      distributed.y = currentPos;
      currentPos += block.h + spacing;
    }

    return distributed;
  });
}