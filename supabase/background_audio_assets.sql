create table if not exists public.background_audio_assets (
  asset_key text primary key,
  audio_path text not null,
  updated_at timestamptz not null default now()
);

alter table public.background_audio_assets enable row level security;

drop policy if exists "public can read background audio assets" on public.background_audio_assets;
create policy "public can read background audio assets"
on public.background_audio_assets
for select
to public
using (true);

drop policy if exists "authenticated users can write background audio assets" on public.background_audio_assets;
create policy "authenticated users can write background audio assets"
on public.background_audio_assets
for all
to authenticated
using (true)
with check (true);
