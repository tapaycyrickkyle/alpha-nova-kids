"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AudioAssetMetadataInput = {
  section: string;
  itemKey: string;
  audioPath: string;
};

type AudioAssetMetadataResult = {
  ok: boolean;
  errorMessage: string | null;
};

type AudioAssetMetadataRecord = {
  item_key: string;
  audio_path: string;
};

const audioAssetMetadataCache = new Map<string, string>();
const AUDIO_ASSET_METADATA_STORAGE_KEY = "audio-asset-metadata-cache-v1";

function buildMetadataCacheKey(section: string, itemKey: string) {
  return `${section}::${itemKey}`;
}

function readPersistentMetadataCache() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(AUDIO_ASSET_METADATA_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    return parsedValue as Record<string, string>;
  } catch {
    return {};
  }
}

function writePersistentMetadataCache(cacheEntries: Record<string, string>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      AUDIO_ASSET_METADATA_STORAGE_KEY,
      JSON.stringify(cacheEntries),
    );
  } catch {
    // Ignore quota or serialization issues and continue with memory cache only.
  }
}

function getCachedAudioPath(section: string, itemKey: string) {
  const cacheKey = buildMetadataCacheKey(section, itemKey);
  const memoryValue = audioAssetMetadataCache.get(cacheKey);

  if (memoryValue) {
    return memoryValue;
  }

  const persistentCache = readPersistentMetadataCache();
  const persistentValue = persistentCache[cacheKey];

  if (persistentValue) {
    audioAssetMetadataCache.set(cacheKey, persistentValue);
    return persistentValue;
  }

  return null;
}

function setCachedAudioPath(section: string, itemKey: string, audioPath: string) {
  const cacheKey = buildMetadataCacheKey(section, itemKey);
  audioAssetMetadataCache.set(cacheKey, audioPath);

  const persistentCache = readPersistentMetadataCache();
  persistentCache[cacheKey] = audioPath;
  writePersistentMetadataCache(persistentCache);
}

export async function upsertAudioAssetMetadata({
  section,
  itemKey,
  audioPath,
}: AudioAssetMetadataInput): Promise<AudioAssetMetadataResult> {
  const supabase = getSupabaseBrowserClient();
  const untypedSupabase = supabase as unknown as {
    from: (table: string) => {
      upsert: (
        values: {
          section: string;
          item_key: string;
          audio_path: string;
          updated_at: string;
        },
        options: { onConflict: string },
      ) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await untypedSupabase.from("uploaded_audio_assets").upsert(
    {
      section,
      item_key: itemKey,
      audio_path: audioPath,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "section,item_key",
    },
  );

  if (error) {
    console.warn("Unable to save uploaded audio metadata.", {
      section,
      itemKey,
      audioPath,
      error,
    });

    return {
      ok: false,
      errorMessage: error.message,
    };
  }

  setCachedAudioPath(section, itemKey, audioPath);

  return {
    ok: true,
    errorMessage: null,
  };
}

export async function fetchAudioAssetMetadataMap(
  section: string,
  itemKeys: string[],
): Promise<Record<string, string>> {
  const uniqueItemKeys = [...new Set(itemKeys.filter(Boolean))];

  if (!uniqueItemKeys.length) {
    return {};
  }

  const cachedEntries = uniqueItemKeys
    .map((itemKey) => [itemKey, getCachedAudioPath(section, itemKey)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));

  const missingItemKeys = uniqueItemKeys.filter(
    (itemKey) => !getCachedAudioPath(section, itemKey),
  );

  if (!missingItemKeys.length) {
    return Object.fromEntries(cachedEntries);
  }

  const supabase = getSupabaseBrowserClient();
  const untypedSupabase = supabase as unknown as {
    from: (table: string) => {
      select: (
        columns: string,
      ) => {
        eq: (
          column: string,
          value: string,
        ) => {
          in: (
            column: string,
            values: string[],
          ) => Promise<{ data: AudioAssetMetadataRecord[] | null; error: { message: string } | null }>;
        };
      };
    };
  };

  const { data, error } = await untypedSupabase
    .from("uploaded_audio_assets")
    .select("item_key,audio_path")
    .eq("section", section)
    .in("item_key", missingItemKeys);

  if (error) {
    throw error;
  }

  const fetchedEntries = (data ?? [])
    .filter((record) => record.item_key && record.audio_path)
    .map((record) => [record.item_key, record.audio_path] as const);

  for (const [itemKey, audioPath] of fetchedEntries) {
    setCachedAudioPath(section, itemKey, audioPath);
  }

  return Object.fromEntries([
    ...cachedEntries,
    ...(data ?? [])
      .filter((record) => record.item_key && record.audio_path)
      .map((record) => [record.item_key, record.audio_path]),
  ]);
}

export function primeAudioAssetMetadataCache(section: string, itemKey: string, audioPath: string) {
  if (!section || !itemKey || !audioPath) {
    return;
  }

  setCachedAudioPath(section, itemKey, audioPath);
}
