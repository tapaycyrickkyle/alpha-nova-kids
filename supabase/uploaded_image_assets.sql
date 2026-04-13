create table if not exists public.uploaded_image_assets (
  section text not null,
  item_key text not null,
  image_path text not null,
  thumbnail_path text,
  updated_at timestamptz not null default now(),
  primary key (section, item_key)
);

alter table public.uploaded_image_assets
add column if not exists thumbnail_path text;

alter table public.uploaded_image_assets enable row level security;

drop policy if exists "public can read uploaded image assets" on public.uploaded_image_assets;
create policy "public can read uploaded image assets"
on public.uploaded_image_assets
for select
to public
using (true);

drop policy if exists "authenticated users can write uploaded image assets" on public.uploaded_image_assets;
create policy "authenticated users can write uploaded image assets"
on public.uploaded_image_assets
for all
to authenticated
using (true)
with check (true);
