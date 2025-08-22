# Preview Crash Investigation Report
_Run at: Wed Aug 20 02:06:28 AM UTC 2025_\n

## Environment

- Node: v20.19.3
- npm:  10.8.2
- PWD:  /home/runner/workspace
- Files (top-level):
  total 704
  drwxr-xr-x 1 runner runner   1618 Aug 20 02:06 .
  drwxrwxrwx 1 runner runner     66 Aug 19 18:16 ..
  -rw-r--r-- 1 runner runner     84 Aug 19 00:20 11.5.2
  drwxr-xr-x 1 runner runner     62 Aug 20 02:06 artifacts
  drwxr-xr-x 1 runner runner   9696 Aug 20 02:05 attached_assets
  drwxr-xr-x 1 runner runner     96 Aug 12 02:44 _backups
  -rw-r--r-- 1 runner runner   5842 Aug 15 03:40 BLOCK_10_VERIFICATION.md
  drwxr-xr-x 1 runner runner     32 Aug 20 01:41 .cache
  drwxr-xr-x 1 runner runner    404 Aug 14 03:59 chrome-extension
  -rw-r--r-- 1 runner runner   6637 Aug 15 03:52 CHROME_EXTENSION_MV3_COMPLETE.md
  -rw-r--r-- 1 runner runner   2448 Aug  9 13:35 CHROME_EXTENSION_READY.md
  -rw-r--r-- 1 runner runner   4514 Aug 14 22:59 CLEANUP_SUMMARY.md
  drwxr-xr-x 1 runner runner     72 Aug 19 01:52 client
  -rw-r--r-- 1 runner runner    459 Jul 28 16:46 components.json
  -rw-r--r-- 1 runner runner   7947 Aug 19 19:37 COMPREHENSIVE_SYSTEM_AUDIT.md
  drwxr-xr-x 1 runner runner      6 Jul 29 16:59 .config
  -rw-r--r-- 1 runner runner    744 Aug 15 15:45 debug_mock_mode.html
  drwxr-xr-x 1 runner runner     28 Aug 11 14:37 dist
  drwxr-xr-x 1 runner runner    142 Aug 11 16:04 docs
  -rw-r--r-- 1 runner runner    325 Jul 28 16:46 drizzle.config.ts
  -rw-r--r-- 1 runner runner   1963 Aug 19 01:01 .env.example
  -rw-r--r-- 1 runner runner     39 Aug 11 14:21 .eslintignore
  drwxr-xr-x 1 runner runner    172 Aug 17 22:33 extension
  -rw-r--r-- 1 runner runner  15969 Aug 17 22:34 extension-dist.zip
  -rw-r--r-- 1 runner runner   2614 Aug  9 13:37 EXTENSION_TEST_RESULTS.md
  -rw-r--r-- 1 runner runner  11929 Aug 15 03:52 extension.zip
  -rw-r--r-- 1 runner runner   2070 Aug  9 13:38 FINAL_EXTENSION_STATUS.md
  -rw-r--r-- 1 runner runner      0 Aug 12 15:13 frontend_contract.md 
  drwxr-xr-x 1 runner runner    166 Aug 20 01:44 .git
  drwxr-xr-x 1 runner runner     18 Aug 10 21:27 .github
  -rw-r--r-- 1 runner runner    247 Aug 14 22:56 .gitignore
  drwxr-xr-x 1 runner runner     44 Aug 12 22:33 handoff
  -rw-r--r-- 1 runner runner   1087 Aug  9 19:07 LICENSE
  drwxr-xr-x 1 runner runner     10 Jul 28 16:39 .local
  drwxr-xr-x 1 runner runner      0 Aug 20 02:06 logs
  -rw-r--r-- 1 runner runner  21862 Aug 14 04:11 lovable_backend_interface_pack_20250812_223405.tar.gz
  drwxr-xr-x 1 runner runner  11690 Aug 20 01:43 node_modules
  -rw-r--r-- 1 runner runner   5599 Aug 20 01:43 package.json
  -rw-r--r-- 1 runner runner 466955 Aug 20 01:43 package-lock.json
  -rw-r--r-- 1 runner runner     62 Aug 19 01:11 postcss.config.cjs
  -rw-r--r-- 1 runner runner   3677 Aug  9 02:18 PROJECT_EXPORT_README.md
  -rw-r--r-- 1 runner runner   8111 Aug  9 19:04 README.md
  -rw-r--r-- 1 runner runner    913 Aug 19 02:40 .replit
  -rw-r--r-- 1 runner runner    838 Aug 19 01:11 .replit.bak
  -rw-r--r-- 1 runner runner   5410 Aug 18 20:20 replit.md
  -rw-r--r-- 1 runner runner  27883 Aug 11 18:30 schema.sql
  drwxr-xr-x 1 runner runner    484 Aug 18 20:19 scripts
  drwxr-xr-x 1 runner runner    462 Aug 20 01:42 server
  drwxr-xr-x 1 runner runner    156 Aug 14 19:02 shared
  drwxr-xr-x 1 runner runner     54 Aug 17 19:09 supabase
  -rw-r--r-- 1 runner runner   5695 Aug  9 20:05 SUPABASE_MIGRATION_GUIDE.md
  -rw-r--r-- 1 runner runner   1722 Aug 10 00:35 supabase-setup.sql
  -rw-r--r-- 1 runner runner    289 Aug 18 15:41 tailwind.config.ts
  -rw-r--r-- 1 runner runner   6491 Aug 14 19:40 TASK_BLOCK_7_VERIFICATION.md
  drwxr-xr-x 1 runner runner    210 Aug 10 21:27 tests
  -rw-r--r-- 1 runner runner    889 Aug 19 01:37 tsconfig.json
  drwxr-xr-x 1 runner runner     20 Aug 20 01:44 .upm
  -rw-r--r-- 1 runner runner    682 Aug 19 01:37 vite.config.ts
  -rw-r--r-- 1 runner runner    285 Aug 10 21:25 vitest.config.ts
  -rw-r--r-- 1 runner runner    246 Aug 10 14:28 vitest.setup.ts

## Key Files Presence

✅ package.json
✅ vite.config.ts
✅ client/index.html
✅ client/src/main.tsx
✅ tailwind.config.ts
✅ postcss.config.cjs
❌ postcss.config.js
✅ client/src/ui-v2/app/UiV2App.tsx

## PostCSS & Tailwind Setup

postcss.config.cjs (first 200 chars):
module.exports = { plugins: { "@tailwindcss/postcss": {} } };

postcss.config.js exists? -> no

Tailwind packages (npm ls):
rest-express@1.0.0 /home/runner/workspace
└── (empty)


## Vite Config & Entry

vite.config.ts (first 200 chars):
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const hasClient = fs.existsSync(path.resolve(__dirname, "client"));
const 
index.html script tag:
12:    <script type="module" src="/src/main.tsx"></script>

main.tsx (first 120 chars):
import React from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import "./ui-v2/index.css"
## UI-V2 Consolidation Checks

Leftover imports from '@/ui-v2/lib/utils' (should be none):
None

Duplicate cn/utils helpers present:
api.ts
shape.ts
utils.ts

## Typecheck (read-only)


> rest-express@1.0.0 typecheck
> tsc --noEmit

client/src/__tests__/App.test.tsx(3,17): error TS2307: Cannot find module '../App' or its corresponding type declarations.
client/src/components/auth/AuthDebug.tsx(4,25): error TS2307: Cannot find module '@/context/AuthContext' or its corresponding type declarations.
client/src/components/auth/RequireAuth.tsx(3,25): error TS2307: Cannot find module '@/context/AuthContext' or its corresponding type declarations.
client/src/components/layout/ProjectSwitcher.tsx(3,35): error TS2307: Cannot find module '@/context/ProjectContext' or its corresponding type declarations.
client/src/components/layout/ProjectSwitcher.tsx(4,29): error TS2307: Cannot find module '@/hooks/useProjects' or its corresponding type declarations.
client/src/hooks/use-auth.tsx(1,55): error TS2307: Cannot find module '../contexts/SupabaseAuthContext' or its corresponding type declarations.
client/src/hooks/use-realtime.tsx(2,33): error TS2307: Cannot find module '../services/supabase-realtime' or its corresponding type declarations.
client/src/hooks/use-realtime.tsx(3,33): error TS2307: Cannot find module '../contexts/SupabaseAuthContext' or its corresponding type declarations.
client/src/hooks/use-realtime.tsx(15,8): error TS7006: Parameter 'capture' implicitly has an 'any' type.
client/src/hooks/use-realtime.tsx(27,8): error TS7006: Parameter 'capture' implicitly has an 'any' type.
client/src/hooks/use-realtime.tsx(32,8): error TS7006: Parameter 'id' implicitly has an 'any' type.
client/src/hooks/use-realtime.tsx(50,8): error TS7006: Parameter 'moment' implicitly has an 'any' type.
client/src/hooks/use-realtime.tsx(77,8): error TS7006: Parameter 'brief' implicitly has an 'any' type.
client/src/hooks/use-storage.tsx(2,32): error TS2307: Cannot find module '../services/supabase-storage' or its corresponding type declarations.
client/src/hooks/use-storage.tsx(3,33): error TS2307: Cannot find module '../contexts/SupabaseAuthContext' or its corresponding type declarations.
client/src/hooks/use-storage.tsx(138,30): error TS7006: Parameter 'r' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/CanvasToolbar.tsx(49,7): error TS2322: Type 'number' is not assignable to type 'string'.
client/src/ui-v2/brief-canvas/CanvasToolbar.tsx(58,7): error TS2353: Object literal may only specify known properties, and 'w' does not exist in type 'Omit<Block, "id">'.
client/src/ui-v2/brief-canvas/CanvasToolbar.tsx(70,7): error TS2353: Object literal may only specify known properties, and 'w' does not exist in type 'Omit<Block, "id">'.
client/src/ui-v2/brief-canvas/SlideList.tsx(86,21): error TS2322: Type '{ children: (false | Element)[]; trigger: Element; align: string; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuProps'.
  Property 'align' does not exist on type 'IntrinsicAttributes & PopoverMenuProps'.
client/src/ui-v2/brief-canvas/SlideList.tsx(99,25): error TS2322: Type '{ children: string; onClick: () => void; icon: Element; destructive: true; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuItemProps'.
  Property 'destructive' does not exist on type 'IntrinsicAttributes & PopoverMenuItemProps'.
client/src/ui-v2/brief-canvas/SlideThumb.tsx(34,7): error TS2322: Type '((e: DragEvent<Element>) => void) | undefined' is not assignable to type '((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void) | undefined'.
  Type '(e: DragEvent<Element>) => void' is not assignable to type '(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void'.
    Types of parameters 'e' and 'event' are incompatible.
      Type 'MouseEvent | TouchEvent | PointerEvent' is not assignable to type 'DragEvent<Element>'.
        Type 'MouseEvent' is missing the following properties from type 'DragEvent<Element>': dataTransfer, nativeEvent, isDefaultPrevented, isPropagationStopped, persist
client/src/ui-v2/brief-canvas/SlideViewport.tsx(59,15): error TS7006: Parameter 'block' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/SlideViewport.tsx(60,12): error TS7006: Parameter 'block' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/SlideViewport.tsx(63,46): error TS7006: Parameter 'b' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/SlideViewport.tsx(143,37): error TS7006: Parameter 'block' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/keyboard.ts(83,78): error TS7006: Parameter 'b' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/keyboard.ts(101,75): error TS7006: Parameter 'b' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(166,47): error TS7006: Parameter 'b' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(180,60): error TS7006: Parameter 'b' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(195,51): error TS7006: Parameter 'b' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(197,52): error TS7006: Parameter 'block' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(210,46): error TS7006: Parameter 'b' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(224,7): error TS2353: Object literal may only specify known properties, and 'captureRefs' does not exist in type 'Slide'.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(224,30): error TS2339: Property 'captureRefs' does not exist on type 'Partial<Slide>'.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(230,18): error TS2339: Property 'slideCount' does not exist on type '{ slides: any[]; id: string; project_id?: string | null | undefined; title: string; status?: string | null | undefined; created_at?: string | undefined; updated_at?: string | undefined; }'.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(257,18): error TS2339: Property 'slideCount' does not exist on type '{ slides: any[]; id: string; project_id?: string | null | undefined; title: string; status?: string | null | undefined; created_at?: string | undefined; updated_at?: string | undefined; }'.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(285,39): error TS7006: Parameter 'block' implicitly has an 'any' type.
client/src/ui-v2/brief-canvas/useCanvasStore.ts(293,18): error TS2339: Property 'slideCount' does not exist on type '{ slides: any[]; id: string; project_id?: string | null | undefined; title: string; status?: string | null | undefined; created_at?: string | undefined; updated_at?: string | undefined; }'.
client/src/ui-v2/components/forms/SearchInput.tsx(3,20): error TS2307: Cannot find module '../../lib/utils' or its corresponding type declarations.
client/src/ui-v2/components/forms/TagInput.tsx(4,20): error TS2307: Cannot find module '../../lib/utils' or its corresponding type declarations.
client/src/ui-v2/components/layout/AppHeader.tsx(18,20): error TS2307: Cannot find module '../../lib/cn' or its corresponding type declarations.
client/src/ui-v2/components/primitives/GlassCard.tsx(2,20): error TS2307: Cannot find module '../../lib/cn' or its corresponding type declarations.
client/src/ui-v2/components/primitives/ShortcutHint.tsx(1,20): error TS2307: Cannot find module '../../lib/utils' or its corresponding type declarations.
client/src/ui-v2/components/primitives/Toolbar.tsx(2,20): error TS2307: Cannot find module '../../lib/utils' or its corresponding type declarations.
client/src/ui-v2/components/truth/ConfidenceBar.tsx(2,20): error TS2307: Cannot find module '../../lib/cn' or its corresponding type declarations.
client/src/ui-v2/components/truth/TruthResultCard.tsx(5,20): error TS2307: Cannot find module '../../lib/cn' or its corresponding type declarations.
client/src/ui-v2/components/truth/TruthTabs.tsx(3,20): error TS2307: Cannot find module '../../lib/cn' or its corresponding type declarations.
client/src/ui-v2/components/truth/VerdictBadge.tsx(3,20): error TS2307: Cannot find module '../../lib/cn' or its corresponding type declarations.
client/src/ui-v2/components/upload/FileDrop.tsx(3,20): error TS2307: Cannot find module '../../lib/cn' or its corresponding type declarations.
client/src/ui-v2/components/upload/FileRow.tsx(3,20): error TS2307: Cannot find module '../../lib/cn' or its corresponding type declarations.
client/src/ui-v2/components/upload/UploadPanel.tsx(5,20): error TS2307: Cannot find module '../../lib/cn' or its corresponding type declarations.
client/src/ui-v2/components/upload/UploadPanel.tsx(61,28): error TS2552: Cannot find name 'uploadCaptures'. Did you mean 'uploadCapture'?
client/src/ui-v2/hooks/useBrief.ts(57,20): error TS2304: Cannot find name 'jobsService'.
client/src/ui-v2/hooks/useBrief.ts(61,20): error TS2339: Property 'status' does not exist on type 'Query<any, Error, any, (string | undefined)[]>'.
client/src/ui-v2/hooks/useBrief.ts(61,50): error TS2339: Property 'status' does not exist on type 'Query<any, Error, any, (string | undefined)[]>'.
client/src/ui-v2/pages/BriefsListPage.tsx(160,27): error TS2322: Type '{ children: Element[]; trigger: Element; align: string; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuProps'.
  Property 'align' does not exist on type 'IntrinsicAttributes & PopoverMenuProps'.
client/src/ui-v2/pages/BriefsListPage.tsx(171,29): error TS2322: Type '{ children: string; onClick: () => void; icon: Element; destructive: true; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuItemProps'.
  Property 'destructive' does not exist on type 'IntrinsicAttributes & PopoverMenuItemProps'.
client/src/ui-v2/pages/BriefsListPage.tsx(253,23): error TS2322: Type '{ children: Element[]; trigger: Element; align: string; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuProps'.
  Property 'align' does not exist on type 'IntrinsicAttributes & PopoverMenuProps'.
client/src/ui-v2/pages/BriefsListPage.tsx(264,25): error TS2322: Type '{ children: string; onClick: () => void; icon: Element; destructive: true; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuItemProps'.
  Property 'destructive' does not exist on type 'IntrinsicAttributes & PopoverMenuItemProps'.
client/src/ui-v2/pages/CapturesInboxPage.tsx(57,32): error TS7006: Parameter 'tag' implicitly has an 'any' type.
client/src/ui-v2/pages/CapturesInboxPage.tsx(190,33): error TS2322: Type '{ children: Element[]; trigger: Element; align: string; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuProps'.
  Property 'align' does not exist on type 'IntrinsicAttributes & PopoverMenuProps'.
client/src/ui-v2/pages/CapturesInboxPage.tsx(193,50): error TS2554: Expected 2 arguments, but got 1.
client/src/ui-v2/pages/CapturesInboxPage.tsx(198,50): error TS2554: Expected 2 arguments, but got 1.
client/src/ui-v2/pages/CapturesInboxPage.tsx(203,50): error TS2554: Expected 2 arguments, but got 1.
client/src/ui-v2/pages/CapturesInboxPage.tsx(321,33): error TS2322: Type '{ children: Element[]; trigger: Element; align: string; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuProps'.
  Property 'align' does not exist on type 'IntrinsicAttributes & PopoverMenuProps'.
client/src/ui-v2/pages/CapturesInboxPage.tsx(324,50): error TS2554: Expected 2 arguments, but got 1.
client/src/ui-v2/pages/CapturesInboxPage.tsx(329,50): error TS2554: Expected 2 arguments, but got 1.
client/src/ui-v2/pages/CapturesInboxPage.tsx(334,50): error TS2554: Expected 2 arguments, but got 1.
client/src/ui-v2/pages/CapturesInboxPage.tsx(385,47): error TS7006: Parameter 'c' implicitly has an 'any' type.
client/src/ui-v2/pages/CapturesInboxPage.tsx(442,43): error TS7006: Parameter 'tag' implicitly has an 'any' type.
client/src/ui-v2/pages/FeedsPage.tsx(19,42): error TS2339: Property 'toggleFeed' does not exist on type '{ feeds: never[] | Paginated<UserFeed>; isLoading: boolean; error: Error | null; createFeed: UseMutateAsyncFunction<UserFeed, Error, { feed_url: string; title?: string | ... 1 more ... | undefined; project_id?: string | ... 1 more ... | undefined; }, unknown>; ... 4 more ...; isDeleting: boolean; }'.
client/src/ui-v2/pages/FeedsPage.tsx(30,11): error TS2561: Object literal may only specify known properties, but 'feedUrl' does not exist in type '{ id: string; } & Partial<UserFeed>'. Did you mean to write 'feed_url'?
client/src/ui-v2/pages/FeedsPage.tsx(40,11): error TS2561: Object literal may only specify known properties, but 'feedUrl' does not exist in type '{ feed_url: string; title?: string | null | undefined; project_id?: string | null | undefined; }'. Did you mean to write 'feed_url'?
client/src/ui-v2/pages/FeedsPage.tsx(60,7): error TS2561: Object literal may only specify known properties, but 'feedUrl' does not exist in type '{ feed_url: string; title?: string | null | undefined; project_id?: string | null | undefined; }'. Did you mean to write 'feed_url'?
client/src/ui-v2/pages/FeedsPage.tsx(121,70): error TS2339: Property 'filter' does not exist on type 'never[] | Paginated<UserFeed>'.
  Property 'filter' does not exist on type 'Paginated<UserFeed>'.
client/src/ui-v2/pages/FeedsPage.tsx(121,77): error TS7006: Parameter 'f' implicitly has an 'any' type.
client/src/ui-v2/pages/FeedsPage.tsx(125,21): error TS2339: Property 'length' does not exist on type 'never[] | Paginated<UserFeed>'.
  Property 'length' does not exist on type 'Paginated<UserFeed>'.
client/src/ui-v2/pages/FeedsPage.tsx(143,22): error TS2339: Property 'map' does not exist on type 'never[] | Paginated<UserFeed>'.
  Property 'map' does not exist on type 'Paginated<UserFeed>'.
client/src/ui-v2/pages/FeedsPage.tsx(143,27): error TS7006: Parameter 'feed' implicitly has an 'any' type.
client/src/ui-v2/pages/FeedsPage.tsx(143,33): error TS7006: Parameter 'index' implicitly has an 'any' type.
client/src/ui-v2/pages/FeedsPage.tsx(204,27): error TS2322: Type '{ children: Element[]; trigger: Element; align: string; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuProps'.
  Property 'align' does not exist on type 'IntrinsicAttributes & PopoverMenuProps'.
client/src/ui-v2/pages/FeedsPage.tsx(215,29): error TS2322: Type '{ children: string; onClick: () => void; icon: Element; destructive: true; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuItemProps'.
  Property 'destructive' does not exist on type 'IntrinsicAttributes & PopoverMenuItemProps'.
client/src/ui-v2/pages/ProjectsPage.tsx(11,36): error TS2339: Property 'updateProject' does not exist on type '{ projects: any; isLoading: boolean; error: Error | null; createProject: UseMutateAsyncFunction<unknown, Error, { name: string; }, unknown>; isCreating: boolean; }'.
client/src/ui-v2/pages/ProjectsPage.tsx(11,51): error TS2339: Property 'deleteProject' does not exist on type '{ projects: any; isLoading: boolean; error: Error | null; createProject: UseMutateAsyncFunction<unknown, Error, { name: string; }, unknown>; isCreating: boolean; }'.
client/src/ui-v2/pages/ProjectsPage.tsx(21,29): error TS18046: 'project' is of type 'unknown'.
client/src/ui-v2/pages/ProjectsPage.tsx(36,17): error TS7006: Parameter 'error' implicitly has an 'any' type.
client/src/ui-v2/pages/ProjectsPage.tsx(51,53): error TS7006: Parameter 'p' implicitly has an 'any' type.
client/src/ui-v2/pages/ProjectsPage.tsx(54,17): error TS7006: Parameter 'error' implicitly has an 'any' type.
client/src/ui-v2/pages/ProjectsPage.tsx(87,28): error TS7006: Parameter 'project' implicitly has an 'any' type.
client/src/ui-v2/pages/ProjectsPage.tsx(87,37): error TS7006: Parameter 'index' implicitly has an 'any' type.
client/src/ui-v2/pages/ProjectsPage.tsx(132,21): error TS2322: Type '{ children: (false | Element)[]; trigger: Element; align: string; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuProps'.
  Property 'align' does not exist on type 'IntrinsicAttributes & PopoverMenuProps'.
client/src/ui-v2/pages/ProjectsPage.tsx(151,25): error TS2322: Type '{ children: string; onClick: () => void; icon: Element; destructive: true; }' is not assignable to type 'IntrinsicAttributes & PopoverMenuItemProps'.
  Property 'destructive' does not exist on type 'IntrinsicAttributes & PopoverMenuItemProps'.
client/src/ui-v2/services/moments.ts(58,16): error TS2339: Property 'get' does not exist on type '{ request<T>(path: string, init?: RequestInit): Promise<T>; }'.
client/src/ui-v2/services/moments.ts(68,16): error TS2339: Property 'get' does not exist on type '{ request<T>(path: string, init?: RequestInit): Promise<T>; }'.
client/src/ui-v2/services/moments.ts(81,16): error TS2339: Property 'patch' does not exist on type '{ request<T>(path: string, init?: RequestInit): Promise<T>; }'.
client/src/ui-v2/services/projects.ts(10,43): error TS18046: 'res' is of type 'unknown'.
client/src/ui-v2/services/projects.ts(10,55): error TS18046: 'res' is of type 'unknown'.
scripts/smoke-e2e.ts(59,40): error TS2339: Property 'access_token' does not exist on type 'GenerateLinkProperties'.
scripts/smoke.ts(60,44): error TS18046: 'error' is of type 'unknown'.
server/auth.ts(4,12): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/auth.ts(11,12): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/auth.ts(15,11): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/index.ts(2,21): error TS7016: Could not find a declaration file for module 'express-session'. '/home/runner/workspace/node_modules/express-session/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/express-session` if it exists or add a new declaration (.d.ts) file containing `declare module 'express-session';`
server/index.ts(3,29): error TS7016: Could not find a declaration file for module 'connect-pg-simple'. '/home/runner/workspace/node_modules/connect-pg-simple/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/connect-pg-simple` if it exists or add a new declaration (.d.ts) file containing `declare module 'connect-pg-simple';`
server/lib/cache.ts(41,32): error TS2683: 'this' implicitly has type 'any' because it does not have a type annotation.
server/middleware/ext-auth.ts(37,15): error TS7006: Parameter 'err' implicitly has an 'any' type.
server/middleware/validation.ts(43,7): error TS2322: Type 'T' is not assignable to type 'ParsedQs'.
server/middleware/validation.ts(61,7): error TS2322: Type 'T' is not assignable to type 'ParamsDictionary'.
server/prod-server.ts(9,28): error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.
server/prod-server.ts(29,10): error TS7006: Parameter 'req' implicitly has an 'any' type.
server/prod-server.ts(29,15): error TS7006: Parameter '_res' implicitly has an 'any' type.
server/prod-server.ts(29,21): error TS7006: Parameter 'next' implicitly has an 'any' type.
server/prod-server.ts(31,15): error TS7006: Parameter 'req' implicitly has an 'any' type.
server/prod-server.ts(31,20): error TS7006: Parameter 'res' implicitly has an 'any' type.
server/prod-server.ts(31,25): error TS7006: Parameter 'next' implicitly has an 'any' type.
server/routes.ts(404,28): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(451,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(483,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(488,58): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(520,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(536,58): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(677,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(682,54): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(689,23): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(699,23): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(711,23): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(723,23): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(735,23): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(747,23): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(803,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(827,16): error TS2339: Property 'session' does not exist on type 'Request<{ captureId: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(854,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(873,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(901,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(905,32): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(928,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1102,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1141,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1657,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1661,60): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1671,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1689,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1695,21): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1707,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1724,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1739,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1758,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1776,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1790,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1804,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1837,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1868,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1882,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1961,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(1965,58): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2015,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2019,58): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2171,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2177,60): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2189,31): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2201,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2336,11): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2341,11): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2341,25): error TS7006: Parameter 'err' implicitly has an 'any' type.
server/routes.ts(2379,11): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2384,11): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2384,25): error TS7006: Parameter 'err' implicitly has an 'any' type.
server/routes.ts(2413,9): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2413,26): error TS7006: Parameter 'err' implicitly has an 'any' type.
server/routes.ts(2424,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes.ts(2430,54): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(17,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(21,61): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(32,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(39,21): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(60,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(69,21): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(102,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(113,21): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(132,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(136,58): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(161,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/analytics.ts(165,54): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(29,16): error TS2339: Property 'session' does not exist on type 'Request<{ captureId: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(38,28): error TS2339: Property 'session' does not exist on type 'Request<{ captureId: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(40,54): error TS2339: Property 'session' does not exist on type 'Request<{ captureId: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(53,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(65,35): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(67,62): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(82,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(95,46): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(101,21): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(117,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(128,37): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(143,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(154,37): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(169,16): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/annotations.ts(182,37): error TS2339: Property 'session' does not exist on type 'Request<{ id: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/brief-canvas.ts(181,9): error TS18046: 'error' is of type 'unknown'.
server/routes/brief-canvas.ts(182,44): error TS18046: 'error' is of type 'unknown'.
server/routes/brief-canvas.ts(363,9): error TS18046: 'error' is of type 'unknown'.
server/routes/brief-canvas.ts(364,44): error TS18046: 'error' is of type 'unknown'.
server/routes/brief-canvas.ts(420,35): error TS18046: 'error' is of type 'unknown'.
server/routes/captures-upload.ts(113,36): error TS7016: Could not find a declaration file for module 'pdf-parse'. '/home/runner/workspace/node_modules/pdf-parse/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/pdf-parse` if it exists or add a new declaration (.d.ts) file containing `declare module 'pdf-parse';`
server/routes/export-jobs.ts(39,46): error TS2339: Property 'createSlidesDeck' does not exist on type 'GoogleSlidesService'.
server/routes/ext-capture.ts(50,7): error TS2561: Object literal may only specify known properties, but 'user_id' does not exist in type '{ type: string; projectId: string; userId: string; summary?: string | null | undefined; title?: string | null | undefined; metadata?: Json | undefined; content?: string | null | undefined; ... 27 more ...; isDraft?: boolean | ... 1 more ... | undefined; }'. Did you mean to write 'userId'?
server/routes/ext-capture.ts(64,50): error TS2307: Cannot find module '../services/analysis/enqueue' or its corresponding type declarations.
server/routes/ext-capture.ts(72,80): error TS18046: 'enqueueError' is of type 'unknown'.
server/routes/google-export.ts(43,22): error TS18048: 'req.user' is possibly 'undefined'.
server/routes/google-export.ts(56,21): error TS2339: Property 'user_id' does not exist on type '{ id: string; title: string; status: string | null; projectId: string; description: string | null; createdAt: Date | null; updatedAt: Date | null; templateType: string | null; }'.
server/routes/google-export.ts(76,62): error TS2339: Property 'define_section' does not exist on type '{ id: string; title: string; status: string | null; projectId: string; description: string | null; createdAt: Date | null; updatedAt: Date | null; templateType: string | null; }'.
server/routes/google-export.ts(83,61): error TS2339: Property 'shift_section' does not exist on type '{ id: string; title: string; status: string | null; projectId: string; description: string | null; createdAt: Date | null; updatedAt: Date | null; templateType: string | null; }'.
server/routes/google-export.ts(90,63): error TS2339: Property 'deliver_section' does not exist on type '{ id: string; title: string; status: string | null; projectId: string; description: string | null; createdAt: Date | null; updatedAt: Date | null; templateType: string | null; }'.
server/routes/google-export.ts(102,30): error TS2339: Property 'client_profile_id' does not exist on type '{ id: string; title: string; status: string | null; projectId: string; description: string | null; createdAt: Date | null; updatedAt: Date | null; templateType: string | null; }'.
server/routes/google-export.ts(110,9): error TS2353: Object literal may only specify known properties, and 'drive_file_id' does not exist in type 'Partial<{ title: string; projectId: string; status?: string | null | undefined; clientId?: string | null | undefined; defineContent?: { lifeLens?: string | undefined; rawBehavior?: string | undefined; channelVibes?: Record<...> | undefined; } | null | undefined; shiftContent?: { ...; } | ... 1 more ... | undefined; ...'.
server/routes/google-export.ts(160,37): error TS18048: 'req.user' is possibly 'undefined'.
server/routes/google-exports.ts(55,9): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(71,28): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(149,14): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(194,63): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(201,65): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(208,61): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(215,65): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(222,63): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(245,27): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(248,27): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(249,28): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(250,21): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(319,14): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(336,61): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(361,39): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(363,37): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/google-exports.ts(365,39): error TS2339: Property 'session' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
server/routes/settings.ts(35,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/settings.ts(39,56): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/settings.ts(44,23): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/settings.ts(77,16): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/settings.ts(84,56): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/settings.ts(88,57): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/settings.ts(92,23): error TS2339: Property 'session' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
server/routes/settings.ts(110,16): error TS2339: Property 'session' does not exist on type 'Request<{ category: string; }, any, any, ParsedQs, Record<string, any>>'.
server/routes/settings.ts(124,61): error TS2339: Property 'session' does not exist on type 'Request<{ category: string; }, any, any, ParsedQs, Record<string, any>>'.
server/services/google/drive.ts(32,9): error TS2353: Object literal may only specify known properties, and 'q' does not exist in type 'BodyResponseCallback<Schema$FileList>'.
server/services/google/drive.ts(36,26): error TS2339: Property 'data' does not exist on type '{ data: { files: never[]; }; } | (Promise<{ data: { files: never[]; }; }> & void) | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<{ data: { files: never[]; }; }> & void'.
server/services/google/drive.ts(36,55): error TS2339: Property 'data' does not exist on type '{ data: { files: never[]; }; } | (Promise<{ data: { files: never[]; }; }> & void) | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<{ data: { files: never[]; }; }> & void'.
server/services/google/drive.ts(38,31): error TS2339: Property 'data' does not exist on type '{ data: { files: never[]; }; } | (Promise<{ data: { files: never[]; }; }> & void) | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<{ data: { files: never[]; }; }> & void'.
server/services/google/drive.ts(44,9): error TS2353: Object literal may only specify known properties, and 'requestBody' does not exist in type 'BodyResponseCallback<Schema$File>'.
server/services/google/drive.ts(51,29): error TS2339: Property 'data' does not exist on type '{ data: { id: string; webViewLink: string; }; } | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (Promise<{ data: { id: string; webViewLink: string; }; }> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<GaxiosResponseWithHTTP2<Readable>> & void'.
server/services/google/drive.ts(65,9): error TS2353: Object literal may only specify known properties, and 'requestBody' does not exist in type 'BodyResponseCallback<Schema$File>'.
server/services/google/drive.ts(74,26): error TS2339: Property 'data' does not exist on type '{ data: { id: string; webViewLink: string; }; } | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (Promise<{ data: { id: string; webViewLink: string; }; }> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<GaxiosResponseWithHTTP2<Readable>> & void'.
server/services/google/drive.ts(75,31): error TS2339: Property 'data' does not exist on type '{ data: { id: string; webViewLink: string; }; } | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (Promise<{ data: { id: string; webViewLink: string; }; }> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<GaxiosResponseWithHTTP2<Readable>> & void'.
server/services/google/drive.ts(90,9): error TS2353: Object literal may only specify known properties, and 'fileId' does not exist in type 'BodyResponseCallback<Schema$File>'.
server/services/google/drive.ts(94,23): error TS2339: Property 'data' does not exist on type '{ data: { id: any; name: string; webViewLink: string; exportLinks: {}; }; } | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (Promise<{ ...; }> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<GaxiosResponseWithHTTP2<Readable>> & void'.
server/services/google/slides.ts(64,9): error TS2353: Object literal may only specify known properties, and 'requestBody' does not exist in type 'BodyResponseCallback<Schema$Presentation>'.
server/services/google/slides.ts(69,43): error TS2339: Property 'data' does not exist on type '{ data: { presentationId: string; title: any; }; } | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (Promise<{ data: { presentationId: string; title: any; }; }> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<GaxiosResponseWithHTTP2<Readable>> & void'.
server/services/google/slides.ts(75,9): error TS2353: Object literal may only specify known properties, and 'fileId' does not exist in type 'BodyResponseCallback<Schema$File>'.
server/services/google/slides.ts(88,11): error TS2353: Object literal may only specify known properties, and 'presentationId' does not exist in type 'BodyResponseCallback<Schema$Presentation>'.
server/services/google/slides.ts(91,49): error TS2339: Property 'data' does not exist on type '{ data: { presentationId: any; slides: { objectId: string; }[]; }; } | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (Promise<{ data: { presentationId: any; slides: { ...; }[]; }; }> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<GaxiosResponseWithHTTP2<Readable>> & void'.
server/services/google/slides.ts(220,11): error TS2353: Object literal may only specify known properties, and 'presentationId' does not exist in type 'BodyResponseCallback<Schema$BatchUpdatePresentationResponse>'.
server/types/session.ts(3,16): error TS2665: Invalid module name in augmentation. Module 'express-session' resolves to an untyped module at '/home/runner/workspace/node_modules/express-session/index.js', which cannot be augmented.
server/workers/analysis/pipeline.ts(90,7): error TS2322: Type 'string' is not assignable to type '"google" | "openai" | "mock"'.
vite.config.ts(2,19): error TS2307: Cannot find module '@vitejs/plugin-react' or its corresponding type declarations.

Typecheck exit code: 0
## Build Attempt (without serve)
Build exit code: 0
