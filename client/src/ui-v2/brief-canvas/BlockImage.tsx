import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Block } from './types';
import { useCanvasStore } from './useCanvasStore';
import { ExternalLink } from 'lucide-react';

interface BlockImageProps {
  block: Block & { type: 'image' };
}

export function BlockImage({ block }: BlockImageProps) {
  const { selectedBlockIds } = useCanvasStore();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSelected = selectedBlockIds.includes(block.id);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div
      className={cn(
        'w-full h-full relative overflow-hidden rounded glass-border',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2'
      )}
    >
      {!imageError ? (
        <>
          <img
            src={block.src}
            alt={block.alt || 'Image'}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-200',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-sm mb-1">Image failed to load</div>
            <div className="text-xs opacity-70">Check the URL</div>
          </div>
        </div>
      )}

      {/* Provenance indicator */}
      {block.sourceCaptureId && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/70 text-ink text-xs px-2 py-1 rounded flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Source
          </div>
        </div>
      )}
    </div>
  );
}