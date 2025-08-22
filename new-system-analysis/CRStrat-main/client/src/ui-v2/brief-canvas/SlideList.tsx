import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Plus, MoreVertical, Copy, Trash2 } from 'lucide-react';
import { SlideThumb } from './SlideThumb';
import { useCanvasStore } from './useCanvasStore';
import { PopoverMenu, PopoverMenuItem } from '../components/primitives/PopoverMenu';

export function SlideList() {
  const {
    brief,
    currentSlideIndex,
    setCurrentSlideIndex,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlides,
  } = useCanvasStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!brief) return null;

  const handleReorder = (newOrder: any[]) => {
    // Find the moved slide
    const oldIndex = brief.slides.findIndex(slide => slide.id === newOrder[0].id);
    const newIndex = newOrder.findIndex(slide => slide.id === newOrder[0].id);
    
    if (oldIndex !== newIndex) {
      reorderSlides(oldIndex, newIndex);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-1 md:p-2 lg:p-4 glass-border-b">
        <div className="flex items-center justify-between mb-1 md:mb-2 lg:mb-3">
          <h3 className="font-medium text-xs md:text-sm lg:text-base hidden lg:block">Slides</h3>
          <h3 className="font-medium text-xs lg:hidden">S</h3>
          <button
            onClick={() => addSlide()}
            className="p-1 md:p-1.5 glass-hover rounded-lg transition-colors touch-target"
            title="Add slide"
          >
            <Plus className="w-3 md:w-4 h-3 md:h-4" />
          </button>
        </div>
        
        <div className="text-xs text-ink/50 hidden lg:block">
          {brief.slides.length} slide{brief.slides.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Slide List */}
      <div className="flex-1 overflow-y-auto p-1 md:p-2 lg:p-4 space-y-1 md:space-y-2 lg:space-y-3">
        <Reorder.Group
          axis="y"
          values={brief.slides}
          onReorder={handleReorder}
          className="space-y-1 md:space-y-2 lg:space-y-3"
        >
          {brief.slides.map((slide, index) => (
            <Reorder.Item
              key={slide.id}
              value={slide}
              className="relative"
              onDragStart={() => setDraggedIndex(index)}
              onDragEnd={() => setDraggedIndex(null)}
            >
              <div className="relative group">
                <SlideThumb
                  slide={slide}
                  index={index}
                  isActive={index === currentSlideIndex}
                  onClick={() => setCurrentSlideIndex(index)}
                />

                {/* Slide Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PopoverMenu
                    trigger={
                      <button className="p-1 bg-black/50 hover:bg-black/70 rounded transition-colors">
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    }
                    align="right"
                  >
                    <PopoverMenuItem
                      onClick={() => duplicateSlide(index)}
                      icon={<Copy className="w-4 h-4" />}
                    >
                      Duplicate Slide
                    </PopoverMenuItem>
                    
                    {brief.slides.length > 1 && (
                      <PopoverMenuItem
                        onClick={() => deleteSlide(index)}
                        icon={<Trash2 className="w-4 h-4" />}
                        destructive
                      >
                        Delete Slide
                      </PopoverMenuItem>
                    )}
                  </PopoverMenu>
                </div>

                {/* Drag indicator */}
                {draggedIndex === index && (
                  <motion.div
                    className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded-lg pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}