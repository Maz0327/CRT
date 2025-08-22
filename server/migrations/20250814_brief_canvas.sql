-- Brief Canvas Schema Migration
-- Pages are optional, but useful for slide-like layout
create table if not exists public.brief_pages (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.dsd_briefs(id) on delete cascade,
  index_no integer not null default 0,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Canvas blocks: text, image, capture_ref, note, quote, shape, etc.
create type if not exists public.brief_block_type as enum (
  'text', 'image', 'capture_ref', 'note', 'quote', 'shape', 'list', 'chart'
);

create table if not exists public.brief_blocks (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.dsd_briefs(id) on delete cascade,
  page_id uuid references public.brief_pages(id) on delete set null,
  type public.brief_block_type not null,
  -- normalized layout for easy UI mapping (tailwind-ish grid or freeform px)
  x integer not null default 0,
  y integer not null default 0,
  w integer not null default 6,
  h integer not null default 4,
  z integer not null default 0,
  rotation numeric(6,2) not null default 0,
  -- content JSON varies by type:
  -- text: {html, plain?}
  -- image: {storagePath, alt}
  -- capture_ref: {capture_id}
  -- list: {items: [...]}, quote: {text, author}, chart: {...}
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Snapshots for versioning / undo / "restore"
create table if not exists public.brief_snapshots (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.dsd_briefs(id) on delete cascade,
  created_by uuid not null,
  reason text,
  data jsonb not null, -- full brief state (pages + blocks)
  created_at timestamptz not null default now()
);

-- Lightweight collaborative lock with TTL
create table if not exists public.brief_locks (
  brief_id uuid primary key references public.dsd_briefs(id) on delete cascade,
  locked_by uuid not null,
  lock_token uuid not null,
  expires_at timestamptz not null
);

-- Helpful indexes
create index if not exists idx_brief_pages_brief on public.brief_pages (brief_id, index_no);
create index if not exists idx_brief_blocks_brief on public.brief_blocks (brief_id, page_id, z);
create index if not exists idx_brief_snapshots_brief on public.brief_snapshots (brief_id, created_at desc);

-- Touch trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists trg_pages_touch on public.brief_pages;
create trigger trg_pages_touch before update on public.brief_pages
for each row execute function public.touch_updated_at();

drop trigger if exists trg_blocks_touch on public.brief_blocks;
create trigger trg_blocks_touch before update on public.brief_blocks
for each row execute function public.touch_updated_at();