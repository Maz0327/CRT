import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Slide } from '../types';

interface SlideThumbProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function SlideThumb({ 
  slide, 
  index, 
  isActive, 
  onClick, 
  onDragStart,
  onDragOver,
  onDrop 
}: SlideThumbProps) {
  return (
    <motion.div
      className={cn(
        'group relative cursor-pointer rounded border md:rounded-lg border-2 transition-all duration-200 touch-target',
        isActive 
          ? 'glass-border-active frost-subtle' 
          : 'glass-border glass-hover-border'
      )}
      onClick={onClick}
      draggable
      onDragStart={onDragStart as any}
      onDragOver={onDragOver}
      onDrop={onDrop}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Slide Preview */}
      <div className="aspect-[4/3] p-0.5 md:p-1 lg:p-3">
        <div className="w-full h-full frost-subtle rounded glass-border relative overflow-hidden min-h-[40px] md:min-h-[60px]">
          {/* Render simplified version of blocks */}
          {slide.blocks.map((block) => (
            <div
              key={block.id}
              className={cn(
                'absolute rounded-sm',
                block.type === 'text' && 'frost-card',
                block.type === 'image' && 'frost-strong',
                block.type === 'note' && 'frost-subtle'
              )}
              style={{
                left: `${(block.x / 800) * 100}%`,
                top: `${(block.y / 600) * 100}%`,
                width: `${(block.w / 800) * 100}%`,
                height: `${(block.h / 600) * 100}%`,
                transform: block.rotation ? `rotate(${block.rotation}deg)` : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* Slide Info */}
      <div className="px-1 md:px-2 lg:px-3 pb-1 md:pb-2 lg:pb-3 hidden lg:block">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink/70">
            {index + 1}
          </span>
          <span className="text-xs text-ink/50">
            {slide.blocks.length} blocks
          </span>
        </div>
        
        {slide.title && (
          <div className="text-xs text-ink/80 mt-1 truncate">
            {slide.title}
          </div>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
          layoutId="activeSlide"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </motion.div>
  );
}