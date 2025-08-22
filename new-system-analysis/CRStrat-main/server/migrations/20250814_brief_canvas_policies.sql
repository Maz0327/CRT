-- Brief Canvas RLS Policies
alter table public.brief_pages enable row level security;
alter table public.brief_blocks enable row level security;
alter table public.brief_snapshots enable row level security;
alter table public.brief_locks enable row level security;

-- Replace `auth.uid()` relationship rule with your existing briefs ownership rule.
-- Example assumes briefs has user_id owner.

create policy "owner_select_pages" on public.brief_pages for select
using (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()));
create policy "owner_write_pages" on public.brief_pages for all
using (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()));

create policy "owner_select_blocks" on public.brief_blocks for select
using (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()));
create policy "owner_write_blocks" on public.brief_blocks for all
using (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()));

create policy "owner_select_snapshots" on public.brief_snapshots for select
using (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()));
create policy "owner_write_snapshots" on public.brief_snapshots for all
using (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()));

create policy "owner_select_locks" on public.brief_locks for select
using (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()));
create policy "owner_write_locks" on public.brief_locks for all
using (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.dsd_briefs b where b.id = brief_id and b.user_id = auth.uid()));