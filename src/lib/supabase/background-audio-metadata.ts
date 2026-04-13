"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const BACKGROUND_AUDIO_BUCKET = "app-audio";
export const BACKGROUND_AUDIO_ASSET_KEY = "global-background-music";
export const BACKGROUND_AUDIO_FOLDER = "uploads/background-music/global";
export const BACKGROUND_AUDIO_UPDATED_EVENT = "background-music-updated";

type BackgroundAudioMetadataInput = {
  assetKey: string;
  audioPath: string;
};

type BackgroundAudioMetadataResult = {
  ok: boolean;
  errorMessage: string | null;
};

type BackgroundAudioAssetRecord = {
  asset_key: string;
  audio_path: string;
  updated_at: string;
};

export async function upsertBackgroundAudioMetadata({
  assetKey,
  audioPath,
}: BackgroundAudioMetadataInput): Promise<BackgroundAudioMetadataResult> {
  const supabase = getSupabaseBrowserClient();
  const untypedSupabase = supabase as unknown as {
    from: (table: string) => {
      upsert: (
        values: {
          asset_key: string;
          audio_path: string;
          updated_at: string;
        },
        options: { onConflict: string },
      ) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await untypedSupabase.from("background_audio_assets").upsert(
    {
      asset_key: assetKey,
      audio_path: audioPath,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "asset_key",
    },
  );

  if (error) {
    console.warn("Unable to save background audio metadata.", {
      assetKey,
      audioPath,
      error,
    });

    return {
      ok: false,
      errorMessage: error.message,
    };
  }

  return {
    ok: true,
    errorMessage: null,
  };
}

export async function fetchBackgroundAudioPath(assetKey: string) {
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
          maybeSingle: () => Promise<{
            data: BackgroundAudioAssetRecord | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };

  const { data, error } = await untypedSupabase
    .from("background_audio_assets")
    .select("asset_key,audio_path,updated_at")
    .eq("asset_key", assetKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.audio_path ?? null;
}
