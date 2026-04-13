"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ImageAssetMetadataInput = {
  section: string;
  itemKey: string;
  imagePath: string;
  thumbnailPath?: string | null;
};

type ImageAssetMetadataResult = {
  ok: boolean;
  errorMessage: string | null;
};

type ImageAssetMetadataRecord = {
  item_key: string;
  image_path: string;
  thumbnail_path?: string | null;
};

type FetchImageAssetMetadataOptions = {
  preferThumbnail?: boolean;
};

const imageAssetMetadataCache = new Map<string, string>();
const IMAGE_ASSET_METADATA_STORAGE_KEY = "image-asset-metadata-cache-v1";

function buildMetadataCacheKey(
  section: string,
  itemKey: string,
  preferThumbnail: boolean,
) {
  return `${section}::${itemKey}::${preferThumbnail ? "thumbnail" : "full"}`;
}

function readPersistentMetadataCache() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(IMAGE_ASSET_METADATA_STORAGE_KEY);
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
      IMAGE_ASSET_METADATA_STORAGE_KEY,
      JSON.stringify(cacheEntries),
    );
  } catch {
    // Ignore quota or serialization errors and continue with memory cache only.
  }
}

function getCachedImagePath(section: string, itemKey: string, preferThumbnail: boolean) {
  const cacheKey = buildMetadataCacheKey(section, itemKey, preferThumbnail);
  const memoryValue = imageAssetMetadataCache.get(cacheKey);

  if (memoryValue) {
    return memoryValue;
  }

  const persistentCache = readPersistentMetadataCache();
  const persistentValue = persistentCache[cacheKey];

  if (persistentValue) {
    imageAssetMetadataCache.set(cacheKey, persistentValue);
    return persistentValue;
  }

  return null;
}

function setCachedImagePath(
  section: string,
  itemKey: string,
  imagePath: string,
  preferThumbnail: boolean,
) {
  const cacheKey = buildMetadataCacheKey(section, itemKey, preferThumbnail);
  imageAssetMetadataCache.set(cacheKey, imagePath);

  const persistentCache = readPersistentMetadataCache();
  persistentCache[cacheKey] = imagePath;
  writePersistentMetadataCache(persistentCache);
}

function getPreferredImagePath(record: ImageAssetMetadataRecord) {
  return record.thumbnail_path || record.image_path;
}

function getResolvedImagePath(
  record: ImageAssetMetadataRecord,
  preferThumbnail: boolean,
) {
  return preferThumbnail ? getPreferredImagePath(record) : record.image_path;
}

export async function upsertImageAssetMetadata({
  section,
  itemKey,
  imagePath,
  thumbnailPath = null,
}: ImageAssetMetadataInput): Promise<ImageAssetMetadataResult> {
  const supabase = getSupabaseBrowserClient();
  const untypedSupabase = supabase as unknown as {
    from: (table: string) => {
      upsert: (
        values: {
          section: string;
          item_key: string;
          image_path: string;
          thumbnail_path: string | null;
          updated_at: string;
        },
        options: { onConflict: string },
      ) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await untypedSupabase.from("uploaded_image_assets").upsert(
    {
      section,
      item_key: itemKey,
      image_path: imagePath,
      thumbnail_path: thumbnailPath,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "section,item_key",
    },
  );

  if (error) {
    console.warn("Unable to save uploaded image metadata.", {
      section,
      itemKey,
      imagePath,
      thumbnailPath,
      error,
    });

    return {
      ok: false,
      errorMessage: error.message,
    };
  }

  setCachedImagePath(section, itemKey, thumbnailPath || imagePath, true);
  setCachedImagePath(section, itemKey, imagePath, false);

  return {
    ok: true,
    errorMessage: null,
  };
}

export async function fetchImageAssetMetadataMap(
  section: string,
  itemKeys: string[],
  options: FetchImageAssetMetadataOptions = {},
): Promise<Record<string, string>> {
  const preferThumbnail = options.preferThumbnail ?? true;
  const uniqueItemKeys = [...new Set(itemKeys.filter(Boolean))];

  if (!uniqueItemKeys.length) {
    return {};
  }

  const cachedEntries = uniqueItemKeys
    .map((itemKey) => [itemKey, getCachedImagePath(section, itemKey, preferThumbnail)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));

  const missingItemKeys = uniqueItemKeys.filter(
    (itemKey) => !getCachedImagePath(section, itemKey, preferThumbnail),
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
          ) => Promise<{ data: ImageAssetMetadataRecord[] | null; error: { message: string } | null }>;
        };
      };
    };
  };

  const { data, error } = await untypedSupabase
    .from("uploaded_image_assets")
    .select("item_key,image_path,thumbnail_path")
    .eq("section", section)
    .in("item_key", missingItemKeys);

  if (error) {
    throw error;
  }

  const fetchedEntries = (data ?? [])
    .filter((record) => record.item_key && record.image_path)
    .map((record) => [record.item_key, getResolvedImagePath(record, preferThumbnail)] as const);

  for (const [itemKey, imagePath] of fetchedEntries) {
    setCachedImagePath(section, itemKey, imagePath, preferThumbnail);
  }

  return Object.fromEntries([
    ...cachedEntries,
    (data ?? [])
      .filter((record) => record.item_key && record.image_path)
      .map((record) => [record.item_key, getResolvedImagePath(record, preferThumbnail)]),
  ]);
}

export function primeImageAssetMetadataCache(section: string, itemKey: string, imagePath: string) {
  if (!section || !itemKey || !imagePath) {
    return;
  }

  setCachedImagePath(section, itemKey, imagePath, true);
  setCachedImagePath(section, itemKey, imagePath, false);
}
