-- extension devices
create table if not exists extension_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid null,
  label text null,
  refresh_token text null, -- hashed if preferred
  last_seen_at timestamptz null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz null
);

-- Pairing codes
create table if not exists extension_pairing_codes (
  code text primary key,           -- short code like "PAIR-AB12CD"
  user_id uuid not null,
  project_id uuid null,
  device_label text null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz null,
  device_id uuid null references extension_devices(id)
);

-- Indexes
create index if not exists idx_ext_dev_user on extension_devices(user_id);
create index if not exists idx_ext_dev_last_seen on extension_devices(last_seen_at);
create index if not exists idx_ext_codes_user on extension_pairing_codes(user_id);
create index if not exists idx_ext_codes_expires on extension_pairing_codes(expires_at);

-- RLS (Postgres or Supabase)
alter table extension_devices enable row level security;
alter table extension_pairing_codes enable row level security;

-- Policies: owners can manage their devices & pairing codes
drop policy if exists p_ext_dev_select on extension_devices;
drop policy if exists p_ext_dev_modify on extension_devices;
create policy p_ext_dev_select on extension_devices
  for select using (auth.uid() = user_id);
create policy p_ext_dev_modify on extension_devices
  using (auth.uid() = user_id);

drop policy if exists p_ext_code_select on extension_pairing_codes;
drop policy if exists p_ext_code_modify on extension_pairing_codes;
create policy p_ext_code_select on extension_pairing_codes
  for select using (auth.uid() = user_id);
create policy p_ext_code_modify on extension_pairing_codes
  using (auth.uid() = user_id);