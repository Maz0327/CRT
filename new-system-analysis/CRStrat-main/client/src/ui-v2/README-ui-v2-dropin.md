# Content Radar UI v2 - Drop-in Frontend

A self-contained React frontend for Content Radar that communicates exclusively with `/api/*` endpoints.

## Overview

This UI module is designed to be a drop-in replacement that can be mounted independently in any React application. It includes:

- **Brief Canvas**: Google Slides-like editor for strategic briefs
- **Capture Triage**: Kanban-style board for organizing content
- **Moments Radar**: Visual timeline of cultural trends
- **Project Management**: Multi-project support
- **Content Feeds**: RSS feed management

## Mounting the UI

### Option 1: Replace main app entry point

```tsx
// src/main.tsx
import { createRoot } from 'react-dom/client';
import { UiV2App } from './ui-v2/app/UiV2App';
import './ui-v2/index.css';

createRoot(document.getElementById('root')!).render(<UiV2App />);
```

### Option 2: Mount as a route

```tsx
// In your existing router
import { UiV2App } from './ui-v2/app/UiV2App';

// Add route
<Route path="/ui-v2/*" element={<UiV2App />} />
```

### Option 3: Conditional mounting

```tsx
// src/main.tsx
import { createRoot } from 'react-dom/client';
import { UiV2App } from './ui-v2/app/UiV2App';
import { LegacyApp } from './App';
import './ui-v2/index.css';

const useV2 = import.meta.env.VITE_USE_UI_V2 === '1';
const App = useV2 ? UiV2App : LegacyApp;

createRoot(document.getElementById('root')!).render(<App />);
```

## Environment Variables

### Required for Production

```env
# API base URL (defaults to /api if not set)
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Development/Preview Mode

```env
# Enable mock mode for Bolt preview (no real API calls)
VITE_UIV2_MOCK=1
```

## API Endpoints Expected

The UI expects these endpoints to be available:

### Authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/google/start` - Google OAuth start URL

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Captures
- `GET /api/captures` - List captures (with query params)
- `GET /api/captures/:id` - Get capture details
- `PATCH /api/captures/:id` - Update capture

### Briefs
- `GET /api/briefs` - List briefs (with query params)
- `POST /api/briefs` - Create brief
- `GET /api/briefs/:id` - Get brief details with slides
- `PATCH /api/briefs/:id` - Update brief metadata
- `POST /api/briefs/:id/save` - Save brief with slides
- `POST /api/briefs/:id/export` - Export to Google Slides
- `DELETE /api/briefs/:id` - Delete brief

### Moments
- `GET /api/moments` - List cultural moments
- `GET /api/moments/:id` - Get moment details
- `PATCH /api/moments/:id` - Update moment

### Feeds
- `GET /api/feeds` - List content feeds
- `POST /api/feeds` - Create feed
- `PATCH /api/feeds/:id` - Update feed
- `DELETE /api/feeds/:id` - Delete feed

### Jobs (for async operations)
- `GET /api/jobs/:id` - Get job status

## Features

### Brief Canvas
- Multi-slide editor with drag-and-drop blocks
- Real-time autosave (every 800ms)
- Keyboard shortcuts for power users
- Snap-to-grid and alignment tools
- Undo/redo with full history
- Draft restoration from localStorage
- Export to Google Slides with job polling

### Capture Triage
- Three-column Kanban board (New, Keep, Trash)
- Drag-and-drop between columns
- Rich filtering by platform, tags, and search
- Bulk operations for efficiency

### Moments Radar
- Visual intensity indicators
- Platform and tag filtering
- Interactive timeline view

## Mock Mode for Development

Set `VITE_UIV2_MOCK=1` to enable mock mode:

- All API calls return sample data
- No network requests made
- Perfect for Bolt preview and development
- Simulates realistic loading delays

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Optimized for mobile with lighter glass effects
- Efficient canvas updates with Zustand
- Query caching with TanStack Query
- Debounced autosave to prevent excessive API calls
- Image lazy loading and error handling

## Keyboard Shortcuts

### Global
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

## Architecture

- **React 18** with TypeScript
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **Framer Motion** for animations
- **Zustand** for canvas state management
- **Tailwind CSS** for styling

## Integration Notes

1. The UI is completely self-contained under `src/ui-v2/`
2. No dependencies on external state management
3. Communicates only via HTTP API calls
4. Handles authentication via localStorage tokens
5. Graceful fallbacks for missing data
6. Mobile-responsive design throughout