import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Image, StickyNote, AlignLeft, AlignCenter, AlignRight, AlignLeft as AlignTop, AlignLeft as AlignMiddle, PanelBottom as AlignBottom, ZoomIn, ZoomOut, Grid, Undo, Redo, Download, Sparkles } from 'lucide-react';
import { Toolbar, ToolbarButton } from '../components/primitives/Toolbar';
import { useCanvasStore } from './useCanvasStore';
import { useBrief } from '../hooks/useBrief';
import { useJob } from '../hooks/useBrief';
import { USE_FIXTURES } from '../fixtures/samples';
import { ShortcutHint } from '../components/primitives/ShortcutHint';

export function CanvasToolbar() {
  const {
    zoom,
    setZoom,
    showGrid,
    toggleGrid,
    selectedBlockIds,
    addBlock,
    undo,
    redo,
    canUndo,
    canRedo,
    brief,
  } = useCanvasStore();

  const { exportBrief, isExporting, exportJobId } = useBrief(brief?.id || '');
  
  // Mock job for fixtures
  const mockJob = exportJobId && USE_FIXTURES ? {
    id: exportJobId,
    status: 'completed' as const,
    result: { url: 'https://docs.google.com/presentation/d/mock-export-url' }
  } : null;
  
  const { data: exportJob } = useJob(exportJobId);
  const currentJob = USE_FIXTURES ? mockJob : exportJob;
  const [showAIModal, setShowAIModal] = useState(false);

  const handleAddTextBlock = () => {
    addBlock({
      type: 'text',
      x: 100,
      y: 100,
            h: 50,
      text: 'Click to edit text',
      align: 'left',
      fontSize: 16,
      weight: "400",
    });
  };

  const handleAddImageBlock = () => {
    addBlock({
      type: 'image',
      x: 100,
      y: 100,
            h: 150,
      src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=150&fit=crop',
      alt: 'Placeholder image',
    });
  };

  const handleAddNoteBlock = () => {
    addBlock({
      type: 'note',
      x: 100,
      y: 100,
            h: 100,
      text: 'Add your note here...',
    });
  };

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);

  const handleExport = () => {
    if (brief) {
      exportBrief();
    }
  };

  return (
    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
      {/* Add Elements */}
      <Toolbar>
        <ToolbarButton onClick={handleAddTextBlock} title="Add Text">
          <Type className="w-4 h-4 stroke-1" />
        </ToolbarButton>
        <ToolbarButton onClick={handleAddImageBlock} title="Add Image">
          <Image className="w-4 h-4 stroke-1" />
        </ToolbarButton>
        <ToolbarButton onClick={handleAddNoteBlock} title="Add Note">
          <StickyNote className="w-4 h-4 stroke-1" />
        </ToolbarButton>
      </Toolbar>

      {/* Alignment */}
      {selectedBlockIds.length > 1 && (
        <Toolbar className="hidden lg:flex">
          <ToolbarButton title="Align Left">
            <AlignLeft className="w-4 h-4 stroke-1" />
          </ToolbarButton>
          <ToolbarButton title="Align Center">
            <AlignCenter className="w-4 h-4 stroke-1" />
          </ToolbarButton>
          <ToolbarButton title="Align Right">
            <AlignRight className="w-4 h-4 stroke-1" />
          </ToolbarButton>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <ToolbarButton title="Align Top">
            <AlignTop className="w-4 h-4 stroke-1" />
          </ToolbarButton>
          <ToolbarButton title="Align Middle">
            <AlignMiddle className="w-4 h-4 stroke-1" />
          </ToolbarButton>
          <ToolbarButton title="Align Bottom">
            <AlignBottom className="w-4 h-4 stroke-1" />
          </ToolbarButton>
        </Toolbar>
      )}

      {/* View Controls */}
      <Toolbar>
        <ToolbarButton onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="w-4 h-4 stroke-1" />
        </ToolbarButton>
        <span className="text-xs px-1 md:px-2 min-w-[35px] md:min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <ToolbarButton onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="w-4 h-4 stroke-1" />
        </ToolbarButton>
        <div className="w-px h-4 md:h-6 bg-white/20 mx-0.5 md:mx-1 hidden md:block" />
        <ToolbarButton 
          onClick={toggleGrid} 
          active={showGrid}
          title="Grid"
        >
          <Grid className="w-4 h-4 stroke-1" />
        </ToolbarButton>
      </Toolbar>

      {/* History */}
      <Toolbar className="hidden md:flex">
        <ToolbarButton 
          onClick={undo} 
          disabled={!canUndo()}
          title="Undo"
        >
          <Undo className="w-4 h-4 stroke-1" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={redo} 
          disabled={!canRedo()}
          title="Redo"
        >
          <Redo className="w-4 h-4 stroke-1" />
        </ToolbarButton>
      </Toolbar>

      {/* Actions */}
      <Toolbar>
        <ToolbarButton 
          onClick={() => setShowAIModal(true)}
          title="AI"
        >
          <Sparkles className="w-4 h-4 stroke-1" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={handleExport}
          disabled={isExporting}
          title="Export"
        >
          <Download className="w-4 h-4 stroke-1" />
          {isExporting && (
            <motion.div
              className="absolute inset-0 bg-blue-500/20 rounded-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </ToolbarButton>
      </Toolbar>

      {/* Keyboard shortcuts hint */}
      <div className="hidden 2xl:flex items-center gap-3 text-xs text-ink/50">
        <ShortcutHint keys={['⌘', 'S']} />
        <span>Save</span>
        <ShortcutHint keys={['G']} />
        <span>Grid</span>
      </div>

      {/* Export status */}
      {currentJob && (
        <div className="glass rounded-lg px-2 py-1 text-xs whitespace-nowrap">
          {currentJob.status === 'pending' && 'Queued...'}
          {currentJob.status === 'running' && 'Exporting...'}
          {currentJob.status === 'completed' && (
            <a 
              href={currentJob.result?.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-400 hover:underline"
            >
              View Slides
            </a>
          )}
          {currentJob.status === 'failed' && (
            <span className="text-red-400">Export failed</span>
          )}
        </div>
      )}
    </div>
  );
}