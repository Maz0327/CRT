# Content Radar UI v2

A modern, Apple-inspired React UI for Content Radar built with TypeScript, Tailwind CSS, and Framer Motion.

## Overview

This is a self-contained UI module that provides a complete frontend experience for Content Radar. It's designed to be mounted independently and communicates with the backend exclusively through API calls.

## Features

- **Apple-inspired Design**: Glass morphism, subtle animations, and premium aesthetics
- **Brief Canvas**: Google Slides-like editor for creating strategic briefs
- **Capture Triage**: Drag-and-drop interface for organizing content captures
- **Moments Radar**: Visual timeline of cultural moments and trends
- **Project Management**: Multi-project support with context switching
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Keyboard Shortcuts**: Power-user features for efficient workflow
- **Autosave & Drafts**: Never lose your work with automatic saving and draft restoration

## Architecture

### Tech Stack
- **React 18** with TypeScript
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **Framer Motion** for animations
- **Zustand** for canvas state management
- **Tailwind CSS** for styling
- **Shadcn/UI** components

### Key Directories

```
client/src/ui-v2/
├── app/                    # App setup and providers
├── components/             # Reusable UI components
├── pages/                  # Page components
├── brief-canvas/           # Canvas editor implementation
├── hooks/                  # React hooks for data fetching
├── services/               # API service layer
├── types/                  # TypeScript type definitions
└── fixtures/               # Sample data for development
```

## Getting Started

### Installation

The required dependencies are already included in the main project's `package.json`:

```bash
npm install
```

### Development

To mount the UI v2 app temporarily for development:

```tsx
// In your main app or a test file
import { UiV2App } from './client/src/ui-v2/app/UiV2App';

function App() {
  
  return <UiV2App />;
}
```

### API Integration

The UI expects these API endpoints to be available:

- `GET /api/auth/me` - Get current user
- `GET /api/projects` - List projects
- `GET /api/captures` - List captures with filtering
- `GET /api/moments` - List cultural moments
- `GET /api/briefs` - List briefs
- `GET /api/briefs/:id` - Get brief details
- `POST /api/briefs/:id/save` - Save brief with slides
- `POST /api/briefs/:id/export` - Export to Google Slides
- `GET /api/feeds` - List content feeds

## Features & Components

### Brief Canvas

The centerpiece of the application - a Google Slides-like editor for creating strategic briefs:

- **Multi-slide support** with thumbnail navigation
- **Drag-and-drop blocks** (text, images, notes)
- **Real-time collaboration** ready (autosave every 800ms)
- **Keyboard shortcuts** for power users
- **Snap-to-grid** and alignment tools
- **Undo/redo** with full history
- **Draft restoration** from localStorage
- **Export to Google Slides**

### Capture Triage

Kanban-style board for organizing content captures:

- **Three columns**: New, Keep, Trash
- **Drag-and-drop** between columns
- **Bulk operations** for efficiency
- **Rich filtering** by platform, tags, and search
- **Visual previews** of images and videos

### Moments Radar

Timeline view of cultural moments:

- **Intensity visualization** with color coding
- **Platform filtering** and tag-based search
- **Interactive timeline** with trend analysis
- **Detailed moment cards** with metadata

## Configuration

### Feature Flags

Set `USE_FIXTURES = true` in `fixtures/samples.ts` to use sample data instead of API calls during development.

### Styling

The UI uses a custom design system built on Tailwind CSS:

- **Glass morphism** effects with `glass` utility class
- **Depth shadows** with `depth-1`, `depth-2`, `depth-3` classes
- **Canvas grid** with `canvas-grid` utility
- **Snap lines** for visual alignment feedback

## Known Stubs

The following features are implemented as UI stubs and need backend integration:

1. **AI Fill** - Button exists but needs AI service integration
2. **Export Polling** - Job status polling is implemented but needs backend jobs API
3. **Truth Analysis** - UI ready but needs analysis service
4. **Visual Evidence** - Placeholder for video/image analysis
5. **Real-time Collaboration** - Infrastructure ready but needs WebSocket integration

## Keyboard Shortcuts

### Global
- `⌘/Ctrl + K` - Open command palette (planned)
- `⌘/Ctrl + S` - Save current work

### Canvas Editor
- `G` - Toggle grid
- `⌘/Ctrl + Z` - Undo
- `⌘/Ctrl + Shift + Z` - Redo
- `Backspace/Delete` - Delete selected blocks
- `⌘/Ctrl + D` - Duplicate selected blocks
- `Arrow keys` - Nudge selected blocks (1px)
- `Shift + Arrow keys` - Nudge selected blocks (10px)
- `⌘/Ctrl + A` - Select all blocks
- `Escape` - Clear selection

### Capture Triage
- `1` - Move to New
- `2` - Move to Keep  
- `3` - Move to Trash
- `T` - Edit tags
- `Enter` - Open details

## Performance

- **Optimized re-renders** with React.memo and useMemo
- **Efficient canvas updates** with Zustand for local state
- **Image lazy loading** and error handling
- **Debounced autosave** to prevent excessive API calls
- **Query caching** with TanStack Query

## Browser Support

- **Chrome/Edge** 90+
- **Firefox** 88+
- **Safari** 14+

## Next Steps

1. **Backend Integration** - Wire up the API endpoints
2. **Real-time Features** - Add WebSocket support for collaboration
3. **AI Services** - Integrate truth analysis and content generation
4. **Mobile Optimization** - Enhance mobile canvas experience
5. **Accessibility** - Add ARIA labels and keyboard navigation