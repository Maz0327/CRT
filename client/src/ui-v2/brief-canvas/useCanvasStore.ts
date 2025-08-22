import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { Block, Slide, BriefDetail } from '../types';

interface CanvasState {
  // Brief data
  brief: BriefDetail | null;
  setBrief: (brief: BriefDetail | null) => void;
  
  // Current slide
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
  
  // Selection
  selectedBlockIds: string[];
  setSelectedBlockIds: (ids: string[]) => void;
  selectBlock: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  // Canvas state
  zoom: number;
  setZoom: (zoom: number) => void;
  panX: number;
  panY: number;
  setPan: (x: number, y: number) => void;
  showGrid: boolean;
  toggleGrid: () => void;
  
  // Editing
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  lastSaved: Date | null;
  setLastSaved: (date: Date) => void;
  
  // History
  history: BriefDetail[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Block operations
  addBlock: (block: Omit<Block, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlocks: (ids: string[]) => void;
  duplicateBlocks: (ids: string[]) => void;
  
  // Slide operations
  addSlide: (slide?: Partial<Slide>) => void;
  updateSlide: (index: number, updates: Partial<Slide>) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Brief data
  brief: null,
  setBrief: (brief) => {
    set({ brief, isDirty: false });
    if (brief) {
      get().pushHistory();
    }
  },
  
  // Current slide
  currentSlideIndex: 0,
  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
  
  // Selection
  selectedBlockIds: [],
  setSelectedBlockIds: (ids) => set({ selectedBlockIds: ids }),
  selectBlock: (id, multi = false) => {
    const { selectedBlockIds } = get();
    if (multi) {
      const newSelection = selectedBlockIds.includes(id)
        ? selectedBlockIds.filter(bid => bid !== id)
        : [...selectedBlockIds, id];
      set({ selectedBlockIds: newSelection });
    } else {
      set({ selectedBlockIds: [id] });
    }
  },
  clearSelection: () => set({ selectedBlockIds: [] }),
  
  // Canvas state
  zoom: 1,
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  panX: 0,
  panY: 0,
  setPan: (x, y) => set({ panX: x, panY: y }),
  showGrid: true,
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  // Editing
  isDirty: false,
  setDirty: (dirty) => set({ isDirty: dirty }),
  lastSaved: null,
  setLastSaved: (date) => set({ lastSaved: date }),
  
  // History
  history: [],
  historyIndex: -1,
  pushHistory: () => {
    const { brief, history, historyIndex } = get();
    if (!brief) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(brief)));
    
    set({
      history: newHistory.slice(-50), // Keep last 50 states
      historyIndex: Math.min(newHistory.length - 1, 49),
    });
  },
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      set({
        brief: JSON.parse(JSON.stringify(previousState)),
        historyIndex: historyIndex - 1,
        isDirty: true,
      });
    }
  },
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        brief: JSON.parse(JSON.stringify(nextState)),
        historyIndex: historyIndex + 1,
        isDirty: true,
      });
    }
  },
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  
  // Block operations
  addBlock: (blockData) => {
    const { brief, currentSlideIndex } = get();
    if (!brief || !brief.slides[currentSlideIndex]) return;
    
    const newBlock: Block = {
      ...blockData,
      id: uuid(),
    } as Block;
    
    const updatedBrief = { ...brief };
    updatedBrief.slides[currentSlideIndex].blocks.push(newBlock);
    
    set({ brief: updatedBrief, isDirty: true, selectedBlockIds: [newBlock.id] });
    get().pushHistory();
  },
  
  updateBlock: (id, updates) => {
    const { brief, currentSlideIndex } = get();
    if (!brief || !brief.slides[currentSlideIndex]) return;
    
    const updatedBrief = { ...brief };
    const slide = updatedBrief.slides[currentSlideIndex];
    const blockIndex = slide.blocks.findIndex(b => b.id === id);
    
    if (blockIndex >= 0) {
      slide.blocks[blockIndex] = { ...slide.blocks[blockIndex], ...updates };
      set({ brief: updatedBrief, isDirty: true });
    }
  },
  
  deleteBlocks: (ids) => {
    const { brief, currentSlideIndex, selectedBlockIds } = get();
    if (!brief || !brief.slides[currentSlideIndex]) return;
    
    const updatedBrief = { ...brief };
    updatedBrief.slides[currentSlideIndex].blocks = 
      updatedBrief.slides[currentSlideIndex].blocks.filter(b => !ids.includes(b.id));
    
    set({ 
      brief: updatedBrief, 
      isDirty: true,
      selectedBlockIds: selectedBlockIds.filter(id => !ids.includes(id))
    });
    get().pushHistory();
  },
  
  duplicateBlocks: (ids) => {
    const { brief, currentSlideIndex } = get();
    if (!brief || !brief.slides[currentSlideIndex]) return;
    
    const slide = brief.slides[currentSlideIndex];
    const blocksToDuplicate = slide.blocks.filter(b => ids.includes(b.id));
    
    const duplicatedBlocks = blocksToDuplicate.map(block => ({
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: block.x + 20,
      y: block.y + 20,
    }));
    
    const updatedBrief = { ...brief };
    updatedBrief.slides[currentSlideIndex].blocks.push(...duplicatedBlocks);
    
    set({ 
      brief: updatedBrief, 
      isDirty: true,
      selectedBlockIds: duplicatedBlocks.map(b => b.id)
    });
    get().pushHistory();
  },
  
  // Slide operations
  addSlide: (slideData = {}) => {
    const { brief } = get();
    if (!brief) return;
    
    const newSlide: Slide = {
      id: uuid(),
      title: slideData.title || `Slide ${brief.slides.length + 1}`,
      blocks: slideData.blocks || [],
      captureRefs: slideData.captureRefs || [],
      ...slideData,
    };
    
    const updatedBrief = { ...brief };
    updatedBrief.slides.push(newSlide);
    updatedBrief.slideCount = updatedBrief.slides.length;
    
    set({ 
      brief: updatedBrief, 
      isDirty: true,
      currentSlideIndex: updatedBrief.slides.length - 1,
      selectedBlockIds: []
    });
    get().pushHistory();
  },
  
  updateSlide: (index, updates) => {
    const { brief } = get();
    if (!brief || !brief.slides[index]) return;
    
    const updatedBrief = { ...brief };
    updatedBrief.slides[index] = { ...updatedBrief.slides[index], ...updates };
    
    set({ brief: updatedBrief, isDirty: true });
  },
  
  deleteSlide: (index) => {
    const { brief, currentSlideIndex } = get();
    if (!brief || brief.slides.length <= 1) return;
    
    const updatedBrief = { ...brief };
    updatedBrief.slides.splice(index, 1);
    updatedBrief.slideCount = updatedBrief.slides.length;
    
    const newCurrentIndex = index >= updatedBrief.slides.length 
      ? updatedBrief.slides.length - 1 
      : currentSlideIndex === index 
        ? Math.max(0, index - 1)
        : currentSlideIndex > index 
          ? currentSlideIndex - 1 
          : currentSlideIndex;
    
    set({ 
      brief: updatedBrief, 
      isDirty: true,
      currentSlideIndex: newCurrentIndex,
      selectedBlockIds: []
    });
    get().pushHistory();
  },
  
  duplicateSlide: (index) => {
    const { brief } = get();
    if (!brief || !brief.slides[index]) return;
    
    const slideToClone = brief.slides[index];
    const duplicatedSlide: Slide = {
      ...slideToClone,
      id: uuid(),
      title: `${slideToClone.title} Copy`,
      blocks: slideToClone.blocks.map(block => ({
        ...block,
        id: uuid(),
      })),
    };
    
    const updatedBrief = { ...brief };
    updatedBrief.slides.splice(index + 1, 0, duplicatedSlide);
    updatedBrief.slideCount = updatedBrief.slides.length;
    
    set({ 
      brief: updatedBrief, 
      isDirty: true,
      currentSlideIndex: index + 1,
      selectedBlockIds: []
    });
    get().pushHistory();
  },
  
  reorderSlides: (fromIndex, toIndex) => {
    const { brief } = get();
    if (!brief) return;
    
    const updatedBrief = { ...brief };
    const [movedSlide] = updatedBrief.slides.splice(fromIndex, 1);
    updatedBrief.slides.splice(toIndex, 0, movedSlide);
    
    set({ 
      brief: updatedBrief, 
      isDirty: true,
      currentSlideIndex: toIndex
    });
    get().pushHistory();
  },
}));