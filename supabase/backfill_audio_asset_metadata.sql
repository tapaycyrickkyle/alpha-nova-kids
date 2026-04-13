-- Backfill uploaded audio metadata from existing Supabase Storage objects.
-- Run this in the Supabase SQL editor after the storage files already exist.

insert into public.uploaded_audio_assets (section, item_key, audio_path, updated_at)
select
  'menu-buttons-audio' as section,
  regexp_replace(split_part(name, '/', 4), '[^a-z0-9]+', '-', 'g') as item_key,
  name as audio_path,
  now() as updated_at
from storage.objects
where bucket_id = 'card-image'
  and name like 'uploads/audio/menu-buttons/%/card-audio-%'
on conflict (section, item_key) do update
set
  audio_path = excluded.audio_path,
  updated_at = excluded.updated_at;

insert into public.uploaded_audio_assets (section, item_key, audio_path, updated_at)
select
  'numbers-audio' as section,
  regexp_replace(split_part(name, '/', 4), '[^a-z0-9]+', '-', 'g') as item_key,
  name as audio_path,
  now() as updated_at
from storage.objects
where bucket_id = 'card-image'
  and name like 'uploads/audio/numbers/%/card-audio-%'
on conflict (section, item_key) do update
set
  audio_path = excluded.audio_path,
  updated_at = excluded.updated_at;

insert into public.uploaded_audio_assets (section, item_key, audio_path, updated_at)
select
  'weather-audio' as section,
  regexp_replace(split_part(name, '/', 4), '[^a-z0-9]+', '-', 'g') as item_key,
  name as audio_path,
  now() as updated_at
from storage.objects
where bucket_id = 'card-image'
  and name like 'uploads/audio/weather/%/card-audio-%'
on conflict (section, item_key) do update
set
  audio_path = excluded.audio_path,
  updated_at = excluded.updated_at;

insert into public.uploaded_audio_assets (section, item_key, audio_path, updated_at)
select
  'colors-audio' as section,
  regexp_replace(split_part(name, '/', 4), '[^a-z0-9]+', '-', 'g') as item_key,
  name as audio_path,
  now() as updated_at
from storage.objects
where bucket_id = 'card-image'
  and name like 'uploads/audio/colors/%/card-audio-%'
on conflict (section, item_key) do update
set
  audio_path = excluded.audio_path,
  updated_at = excluded.updated_at;

insert into public.uploaded_audio_assets (section, item_key, audio_path, updated_at)
select
  'shapes-audio' as section,
  regexp_replace(split_part(name, '/', 4), '[^a-z0-9]+', '-', 'g') as item_key,
  name as audio_path,
  now() as updated_at
from storage.objects
where bucket_id = 'card-image'
  and name like 'uploads/audio/shapes/%/card-audio-%'
on conflict (section, item_key) do update
set
  audio_path = excluded.audio_path,
  updated_at = excluded.updated_at;

insert into public.uploaded_audio_assets (section, item_key, audio_path, updated_at)
select
  'phonics-audio' as section,
  regexp_replace(split_part(name, '/', 4), '[^a-z0-9]+', '-', 'g') as item_key,
  name as audio_path,
  now() as updated_at
from storage.objects
where bucket_id = 'card-image'
  and name like 'uploads/audio/phonics/%/card-audio-%'
on conflict (section, item_key) do update
set
  audio_path = excluded.audio_path,
  updated_at = excluded.updated_at;

insert into public.uploaded_audio_assets (section, item_key, audio_path, updated_at)
select
  'pronunciation-audio' as section,
  regexp_replace(split_part(name, '/', 4), '[^a-z0-9]+', '-', 'g') as item_key,
  name as audio_path,
  now() as updated_at
from storage.objects
where bucket_id = 'card-image'
  and name like 'uploads/audio/pronunciation/%/card-audio-%'
on conflict (section, item_key) do update
set
  audio_path = excluded.audio_path,
  updated_at = excluded.updated_at;

insert into public.uploaded_audio_assets (section, item_key, audio_path, updated_at)
select
  'phonics-letter-detail-audio' as section,
  concat(
    regexp_replace(split_part(name, '/', 4), '[^a-z0-9]+', '-', 'g'),
    '-',
    regexp_replace(split_part(name, '/', 5), '[^a-z0-9]+', '-', 'g')
  ) as item_key,
  name as audio_path,
  now() as updated_at
from storage.objects
where bucket_id = 'card-image'
  and name like 'uploads/audio/phonics-letter-detail/%/%/card-audio-%'
on conflict (section, item_key) do update
set
  audio_path = excluded.audio_path,
  updated_at = excluded.updated_at;

insert into public.background_audio_assets (asset_key, audio_path, updated_at)
select
  'global-background-music' as asset_key,
  name as audio_path,
  now() as updated_at
from storage.objects
where bucket_id = 'app-audio'
  and name like 'uploads/background-music/global/background-music-%'
order by created_at desc nulls last
limit 1
on conflict (asset_key) do update
set
  audio_path = excluded.audio_path,
  updated_at = excluded.updated_at;
