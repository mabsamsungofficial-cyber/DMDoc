-- DMDoc V1 Production Schema (Supabase PostgreSQL)
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- 1. Docs Table
create table if not exists public.docs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  content text not null,
  cta_label text default '',
  cta_url text default '',
  is_public boolean not null default true,
  show_ad boolean not null default true,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_docs_slug on public.docs(slug);
create index if not exists idx_docs_user_id on public.docs(user_id);

-- 2. Global Ad / Sponsor Settings Table (single row: id = 'global')
create table if not exists public.app_settings (
  id text primary key default 'global',
  user_id uuid not null references auth.users(id) on delete cascade,
  ad_enabled boolean not null default true,
  ad_mode text not null default 'sponsor' check (ad_mode in ('sponsor', 'native-ad')),
  ad_badge text default 'Recommended',
  ad_title text default '',
  ad_description text default '',
  ad_cta_label text default 'Open',
  ad_cta_url text default '',
  ad_network_name text default 'Adsterra Native',
  ad_script_code text default '',
  ad_clicks integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 3. Auto-update updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_docs_updated_at on public.docs;
create trigger trg_docs_updated_at
before update on public.docs
for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated_at on public.app_settings;
create trigger trg_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

-- 4. Row Level Security (RLS)
alter table public.docs enable row level security;
alter table public.app_settings enable row level security;

-- Docs policies
drop policy if exists "Public can read public docs" on public.docs;
create policy "Public can read public docs"
  on public.docs for select
  using (is_public = true or auth.uid() = user_id);

drop policy if exists "Owner can insert docs" on public.docs;
create policy "Owner can insert docs"
  on public.docs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Owner can update docs" on public.docs;
create policy "Owner can update docs"
  on public.docs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Owner can delete docs" on public.docs;
create policy "Owner can delete docs"
  on public.docs for delete
  using (auth.uid() = user_id);

-- Settings policies
drop policy if exists "Public can read ad settings" on public.app_settings;
create policy "Public can read ad settings"
  on public.app_settings for select
  using (true);

drop policy if exists "Owner can insert settings" on public.app_settings;
create policy "Owner can insert settings"
  on public.app_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Owner can update settings" on public.app_settings;
create policy "Owner can update settings"
  on public.app_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Safe Anonymous Counter RPCs
create or replace function public.increment_doc_views(target_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.docs
  set views = views + 1
  where slug = target_slug and is_public = true;
end;
$$;

create or replace function public.increment_ad_clicks()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.app_settings
  set ad_clicks = ad_clicks + 1
  where id = 'global';
end;
$$;

grant execute on function public.increment_doc_views(text) to anon, authenticated;
grant execute on function public.increment_ad_clicks() to anon, authenticated;
