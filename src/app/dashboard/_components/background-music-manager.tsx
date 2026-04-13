"use client";

import { useEffect, useRef, useState } from "react";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import {
  BACKGROUND_AUDIO_ASSET_KEY,
  BACKGROUND_AUDIO_BUCKET,
  BACKGROUND_AUDIO_FOLDER,
  BACKGROUND_AUDIO_UPDATED_EVENT,
  fetchBackgroundAudioPath,
  upsertBackgroundAudioMetadata,
} from "@/lib/supabase/background-audio-metadata";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_AUDIO_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
];

type UploadStatus =
  | {
      state: "idle";
      message: null;
    }
  | {
      state: "staged";
      message: string;
    }
  | {
      state: "loading";
      message: string;
    }
  | {
      state: "success";
      message: string;
    }
  | {
      state: "error";
      message: string;
    };

type AudioState = {
  file: File | null;
  fileName: string | null;
  filePath: string | null;
  previewUrl: string | null;
  status: UploadStatus;
};

function createEmptyAudioState(): AudioState {
  return {
    file: null,
    fileName: null,
    filePath: null,
    previewUrl: null,
    status: {
      state: "idle",
      message: null,
    },
  };
}

function buildAudioFilePath(fileName: string) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() ?? "mp3";
  return `${BACKGROUND_AUDIO_FOLDER}/background-music-${Date.now()}.${fileExtension}`;
}

function validateAudioFile(file: File) {
  const hasAllowedMimeType = ALLOWED_AUDIO_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name);

  if (!hasAllowedMimeType && !hasAllowedExtension) {
    return "Please upload an MP3, WAV, OGG, M4A, or AAC audio file.";
  }

  if (file.size > MAX_AUDIO_FILE_SIZE) {
    return "Audio size must be 12MB or smaller.";
  }

  return null;
}

async function createSignedAudioUrl(filePath: string) {
  const supabase = getSupabaseBrowserClient();
  const { data } = supabase.storage.from(BACKGROUND_AUDIO_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function uploadAudioToSupabase(file: File, filePath: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage.from(BACKGROUND_AUDIO_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "audio/mpeg",
  });

  if (error) {
    throw error;
  }
}

async function removeExistingAudioFromSupabase() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(BACKGROUND_AUDIO_BUCKET)
    .list(BACKGROUND_AUDIO_FOLDER, {
      limit: 100,
    });

  if (error) {
    throw error;
  }

  const filePaths = (data ?? [])
    .filter((file) => file.name && !file.name.endsWith("/"))
    .map((file) => `${BACKGROUND_AUDIO_FOLDER}/${file.name}`);

  if (!filePaths.length) {
    return;
  }

  const { error: removeError } = await supabase.storage
    .from(BACKGROUND_AUDIO_BUCKET)
    .remove(filePaths);

  if (removeError) {
    throw removeError;
  }
}

export function BackgroundMusicManager() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>(() => createEmptyAudioState());
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (audioState.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(audioState.previewUrl);
      }
    };
  }, [audioState.previewUrl]);

  useEffect(() => {
    let isCancelled = false;

    async function loadExistingAudio() {
      try {
        const existingFilePath = await fetchBackgroundAudioPath(BACKGROUND_AUDIO_ASSET_KEY);

        if (!existingFilePath) {
          return;
        }

        const signedUrl = await createSignedAudioUrl(existingFilePath);

        if (isCancelled) {
          return;
        }

        setAudioState({
          file: null,
          fileName: existingFilePath.split("/").pop() ?? "background-music",
          filePath: existingFilePath,
          previewUrl: signedUrl,
          status: {
            state: "success",
            message: "Current background music loaded.",
          },
        });
      } catch {
        // Keep the panel usable even if the current track cannot be loaded.
      }
    }

    void loadExistingAudio();

    return () => {
      isCancelled = true;
    };
  }, []);

  function handleChooseAudio() {
    inputRef.current?.click();
  }

  function handleAudioSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationMessage = validateAudioFile(file);

    if (validationMessage) {
      setAudioState((current) => {
        if (current.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(current.previewUrl);
        }

        return {
          file: null,
          fileName: null,
          filePath: null,
          previewUrl: null,
          status: {
            state: "error",
            message: validationMessage,
          },
        };
      });
      event.target.value = "";
      return;
    }

    setAudioState((current) => {
      if (current.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return {
        file,
        fileName: file.name,
        filePath: null,
        previewUrl: URL.createObjectURL(file),
        status: {
          state: "staged",
          message: "Ready to upload. Save to replace the current background music.",
        },
      };
    });

    event.target.value = "";
  }

  async function handleUpload() {
    if (!audioState.file || isUploading) {
      return;
    }

    const filePath = buildAudioFilePath(audioState.file.name);

    setIsUploading(true);
    setAudioState((current) => ({
      ...current,
      filePath,
      status: {
        state: "loading",
        message: "Uploading background music...",
      },
    }));

    try {
      await removeExistingAudioFromSupabase();
      await uploadAudioToSupabase(audioState.file, filePath);

      const metadataResult = await upsertBackgroundAudioMetadata({
        assetKey: BACKGROUND_AUDIO_ASSET_KEY,
        audioPath: filePath,
      });

      const signedUrl = await createSignedAudioUrl(filePath);

      setAudioState((current) => {
        if (current.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(current.previewUrl);
        }

        return {
          file: null,
          fileName: audioState.file?.name ?? filePath.split("/").pop() ?? "background-music",
          filePath,
          previewUrl: signedUrl,
          status: {
            state: "success",
            message: metadataResult.ok
              ? "Background music uploaded successfully."
              : "Music uploaded, but metadata sync failed.",
          },
        };
      });

      window.dispatchEvent(new Event(BACKGROUND_AUDIO_UPDATED_EVENT));
    } catch (error) {
      setAudioState((current) => ({
        ...current,
        filePath,
        status: {
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to upload background music right now.",
        },
      }));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-md md:p-6">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
        className="hidden"
        onChange={handleAudioSelected}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-bold tracking-[0.25em] text-primary uppercase">
            Global Audio
          </p>
          <h3 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-[1.75rem]">
            Background Music
          </h3>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3 md:justify-end">
          <button
            type="button"
            onClick={handleChooseAudio}
            className="cursor-pointer rounded-full border border-primary/15 bg-primary-container/30 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary-container/45"
          >
            Choose Audio
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!audioState.file || isUploading}
            className="cursor-pointer flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <MaterialSymbol name="publish" className="size-4" />
            <span>{isUploading ? "Uploading..." : "Save Music"}</span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div
          role="button"
          tabIndex={0}
          onClick={handleChooseAudio}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleChooseAudio();
            }
          }}
          className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-primary/25 bg-primary-container/10 px-5 py-6 text-center transition-colors hover:bg-primary-container/20"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary">
            <MaterialSymbol name="record_voice_over" className="size-6" />
          </div>
          <p className="mt-4 text-lg font-bold text-on-surface">
            {audioState.file ? "Replace Selected Track" : "Select Background Music"}
          </p>
          <p className="mt-2 max-w-md text-sm leading-5 text-on-surface-variant">
            Recommended: a short MP3 loop with gentle volume.
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-surface-variant/20 bg-surface-container-lowest p-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-container/25 px-3 py-2 text-xs font-bold text-primary">
            <MaterialSymbol name="record_voice_over" className="size-4" />
            <span className="min-w-0 truncate">
              {audioState.fileName ?? "No music uploaded yet"}
            </span>
          </div>

          {audioState.previewUrl ? (
            <audio
              controls
              preload="metadata"
              className="mt-3 w-full"
              src={audioState.previewUrl}
            >
              Your browser does not support audio playback.
            </audio>
          ) : (
            <div className="mt-3 rounded-2xl bg-white/70 px-4 py-4 text-sm text-on-surface-variant">
              Upload a track to preview and save it as the app background music.
            </div>
          )}

          {audioState.status.message ? (
            <div
              className={`mt-3 rounded-2xl px-4 py-3 text-sm ${
                audioState.status.state === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : audioState.status.state === "error"
                    ? "bg-error/10 text-error"
                    : "bg-primary-container/20 text-primary"
              }`}
            >
              <p className="font-semibold">{audioState.status.message}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
