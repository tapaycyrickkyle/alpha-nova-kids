create table if not exists public.uploaded_audio_assets (
  section text not null,
  item_key text not null,
  audio_path text not null,
  updated_at timestamptz not null default now(),
  primary key (section, item_key)
);

alter table public.uploaded_audio_assets enable row level security;

drop policy if exists "public can read uploaded audio assets" on public.uploaded_audio_assets;
create policy "public can read uploaded audio assets"
on public.uploaded_audio_assets
for select
to public
using (true);

drop policy if exists "authenticated users can write uploaded audio assets" on public.uploaded_audio_assets;
create policy "authenticated users can write uploaded audio assets"
on public.uploaded_audio_assets
for all
to authenticated
using (true)
with check (true);
