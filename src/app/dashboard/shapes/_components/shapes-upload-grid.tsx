"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { createThumbnailImageForUpload } from "@/lib/browser-image-normalization";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchAudioAssetMetadataMap,
  upsertAudioAssetMetadata,
} from "@/lib/supabase/audio-asset-metadata";
import {
  fetchImageAssetMetadataMap,
  upsertImageAssetMetadata,
} from "@/lib/supabase/image-asset-metadata";

const SUPABASE_BUCKET = "card-image";
const SUPABASE_IMAGE_FOLDER = "uploads/images/shapes-cards";
const SUPABASE_AUDIO_FOLDER = "uploads/audio/shapes";
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
] as const;

type ShapeCard = {
  name: string;
  label: string;
};

type CardUploadStatus =
  | { state: "idle"; message: null }
  | { state: "staged"; message: string }
  | { state: "loading"; message: string }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

type CardImageState = {
  file: File | null;
  fileName: string | null;
  filePath: string | null;
  previewUrl: string | null;
  status: CardUploadStatus;
};

type CardAudioState = {
  file: File | null;
  fileName: string | null;
  filePath: string | null;
  previewUrl: string | null;
  status: CardUploadStatus;
};

type ShapesUploadGridProps = {
  cards: ShapeCard[];
  onPendingImagesChange?: (count: number) => void;
  uploadAllToken?: number;
  onUploadAllComplete?: () => void;
};

function sanitizeSegment(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildImageFilePath(basePath: string, cardName: string, fileName: string) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  return `${basePath}/${sanitizeSegment(cardName)}/card-image-${Date.now()}.${fileExtension}`;
}

function buildThumbnailFilePath(filePath: string) {
  return filePath.replace(/\.[^.]+$/, "-thumbnail.webp");
}

function buildAudioFilePath(basePath: string, cardName: string, fileName: string) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  return `${basePath}/${sanitizeSegment(cardName)}/card-audio-${Date.now()}.${fileExtension}`;
}

function getStorageBasePath() {
  return SUPABASE_IMAGE_FOLDER;
}

function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "Please upload a PNG, JPG, JPEG, or WEBP image.";
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return "Image size must be 5MB or smaller.";
  }
  return null;
}

function validateAudioFile(file: File) {
  const hasAllowedMimeType = ALLOWED_AUDIO_TYPES.includes(
    file.type as (typeof ALLOWED_AUDIO_TYPES)[number],
  );
  const hasAllowedExtension = /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name);

  if (!hasAllowedMimeType && !hasAllowedExtension) {
    return "Please upload an MP3, WAV, OGG, M4A, or AAC audio file.";
  }
  if (file.size > MAX_AUDIO_FILE_SIZE) {
    return "Audio size must be 12MB or smaller.";
  }
  return null;
}

function createEmptyImageState(): CardImageState {
  return {
    file: null,
    fileName: null,
    filePath: null,
    previewUrl: null,
    status: { state: "idle", message: null },
  };
}

function createEmptyAudioState(): CardAudioState {
  return {
    file: null,
    fileName: null,
    filePath: null,
    previewUrl: null,
    status: { state: "idle", message: null },
  };
}

function createPreviewUrl(filePath: string) {
  const supabase = getSupabaseBrowserClient();
  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function findExistingFilePath(folderPath: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).list(folderPath, { limit: 100 });
  if (error) throw error;

  const firstFile = (data ?? []).find((file) => file.name && !file.name.endsWith("/"));
  return firstFile ? `${folderPath}/${firstFile.name}` : null;
}

async function uploadFileToSupabase(file: File, filePath: string, fallbackType: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || fallbackType,
  });
  if (error) throw error;
}

async function removeFolderFilesFromSupabase(folderPath: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).list(folderPath, { limit: 100 });
  if (error) throw error;

  const filePaths = (data ?? []).map((file) => `${folderPath}/${file.name}`);
  if (!filePaths.length) return;

  const { error: removeError } = await supabase.storage.from(SUPABASE_BUCKET).remove(filePaths);
  if (removeError) throw removeError;
}

function ShapeCardItem({
  card,
  imageState,
  audioState,
  onImageSelected,
  onAudioSelected,
}: {
  card: ShapeCard;
  imageState: CardImageState;
  audioState: CardAudioState;
  onImageSelected: (cardName: string, file: File) => void;
  onAudioSelected: (cardName: string, file: File) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onImageSelected(card.name, file);
    event.target.value = "";
  }

  function handleAudioChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onAudioSelected(card.name, file);
    event.target.value = "";
  }

  const imageButtonLabel = imageState.previewUrl ? "Replace image" : "Upload image";
  const audioButtonLabel = audioState.previewUrl ? "Replace audio" : "Upload audio";

  return (
    <>
      <input ref={imageInputRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} className="hidden" onChange={handleImageChange} />
      <input ref={audioInputRef} type="file" accept="audio/*,.mp3" className="hidden" onChange={handleAudioChange} />

      <div className="group flex h-full flex-col rounded-2xl border border-surface-variant/20 bg-surface-container-lowest p-5 shadow-[0px_10px_30px_rgba(44,47,49,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0px_20px_40px_rgba(44,47,49,0.08)] md:p-6">
        <div className="mb-6 grid grid-cols-[56px_1fr_56px] items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container/20 text-2xl font-black text-primary">
            {card.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 text-center">
            <p className="text-lg font-bold text-on-surface sm:text-xl">{card.label}</p>
          </div>
          <div aria-hidden="true" />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <section className="rounded-2xl border border-surface-variant/20 bg-white/70 p-4">
            <div className="mb-4">
              <p className="text-sm font-semibold text-on-surface">Image</p>
              <p className="text-xs text-on-surface-variant">Add a visual reference for this shape.</p>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => imageInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  imageInputRef.current?.click();
                }
              }}
              className={`relative overflow-hidden rounded-2xl ${
                imageState.previewUrl
                  ? "aspect-[4/5] cursor-pointer bg-surface ring-1 ring-primary-container/20"
                  : "flex min-h-52 cursor-pointer flex-col items-center justify-center border border-dashed border-primary/25 bg-primary-container/10 px-6 py-8 text-center"
              }`}
            >
              {imageState.previewUrl ? (
                <>
                  <Image src={imageState.previewUrl} alt={`${card.label} image preview`} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover" />
                </>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary">
                    <MaterialSymbol name="add_a_photo" className="size-8" />
                  </div>
                  <p className="mt-4 text-lg font-bold text-on-surface">{imageButtonLabel}</p>
                  <p className="mt-1 max-w-[14rem] text-sm text-on-surface-variant">Use a clear child-friendly image for the shape.</p>
                </>
              )}
            </div>

            {imageState.status.message ? (
              <div
                className={`mt-3 rounded-2xl px-3 py-2 text-xs ${
                  imageState.status.state === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : imageState.status.state === "error"
                      ? "bg-error/10 text-error"
                      : "bg-primary-container/20 text-primary"
                }`}
              >
                <p className="font-semibold">{imageState.status.message}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-surface-variant/20 bg-white/70 p-4">
            <div className="mb-4">
              <p className="text-sm font-semibold text-on-surface">Audio</p>
              <p className="text-xs text-on-surface-variant">Upload the MP3 pronunciation clip.</p>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => audioInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  audioInputRef.current?.click();
                }
              }}
              className={`flex aspect-[16/9] items-center justify-center rounded-2xl ${
                audioState.previewUrl
                  ? "cursor-pointer bg-primary-container/10 p-4"
                  : "cursor-pointer border border-dashed border-primary/25 bg-primary-container/10 px-5 py-6 text-center"
              }`}
            >
              {audioState.previewUrl ? (
                <div className="flex w-full flex-col justify-center gap-3" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                  <div className="inline-flex max-w-full items-center gap-2 self-start rounded-full bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm">
                    <MaterialSymbol name="record_voice_over" className="size-4" />
                    <span className="min-w-0 truncate">{audioState.fileName}</span>
                  </div>
                  <audio controls preload="metadata" className="w-full" src={audioState.previewUrl ?? undefined}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : (
                <div className="mx-auto flex w-full max-w-[15rem] flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary sm:h-16 sm:w-16">
                    <MaterialSymbol name="record_voice_over" className="size-7" />
                  </div>
                  <p className="mt-4 text-sm font-bold leading-none text-on-surface sm:text-base">{audioButtonLabel}</p>
                  <p className="mt-2 text-xs leading-5 text-on-surface-variant sm:text-sm">Add the spoken pronunciation for {card.name}.</p>
                </div>
              )}
            </div>

            {audioState.status.message ? (
              <div
                className={`mt-3 rounded-2xl px-3 py-2 text-xs ${
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
          </section>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-on-surface-variant">
          <span>Image + audio required</span>
          <span className={`shrink-0 rounded-full px-3 py-1 font-semibold ${imageState.previewUrl && audioState.previewUrl ? "bg-primary-container/30 text-primary" : "bg-surface text-on-surface-variant"}`}>
            {imageState.previewUrl && audioState.previewUrl ? "Ready" : "Incomplete"}
          </span>
        </div>
      </div>
    </>
  );
}

export function ShapesUploadGrid({
  cards,
  onPendingImagesChange,
  uploadAllToken = 0,
  onUploadAllComplete,
}: ShapesUploadGridProps) {
  const [imageStates, setImageStates] = useState<Record<string, CardImageState>>(
    () => Object.fromEntries(cards.map((card) => [card.name, createEmptyImageState()])),
  );
  const [audioStates, setAudioStates] = useState<Record<string, CardAudioState>>(
    () => Object.fromEntries(cards.map((card) => [card.name, createEmptyAudioState()])),
  );
  const lastUploadTokenRef = useRef(uploadAllToken);

  useEffect(() => {
    return () => {
      for (const imageState of Object.values(imageStates)) {
        if (imageState.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(imageState.previewUrl);
      }
      for (const audioState of Object.values(audioStates)) {
        if (audioState.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(audioState.previewUrl);
      }
    };
  }, [audioStates, imageStates]);

  const pendingImageCount = useMemo(
    () => Object.values(imageStates).filter((imageState) => imageState.file && imageState.status.state !== "success").length +
      Object.values(audioStates).filter((audioState) => audioState.file && audioState.status.state !== "success").length,
    [audioStates, imageStates],
  );

  useEffect(() => {
    onPendingImagesChange?.(pendingImageCount);
  }, [onPendingImagesChange, pendingImageCount]);

  useEffect(() => {
    let isCancelled = false;

    async function loadExistingImages() {
      try {
        const itemKeys = cards.map((card) => sanitizeSegment(card.name));
        const [metadataMap, audioMetadataMap] = await Promise.all([
          fetchImageAssetMetadataMap("shapes", itemKeys),
          fetchAudioAssetMetadataMap("shapes-audio", itemKeys),
        ]);

        await Promise.all(
          cards.map(async (card) => {
            const cardKey = sanitizeSegment(card.name);
            const existingFilePath =
              metadataMap[cardKey] ??
              (await findExistingFilePath(`${getStorageBasePath()}/${cardKey}`));
            const existingAudioPath =
              audioMetadataMap[cardKey] ??
              (await findExistingFilePath(`${SUPABASE_AUDIO_FOLDER}/${cardKey}`));
            if (existingFilePath) {
              const signedPreviewUrl = createPreviewUrl(existingFilePath);
              if (isCancelled) return;

              setImageStates((current) => {
                const currentState = current[card.name];
                if (!currentState || currentState.file) return current;

                return {
                  ...current,
                  [card.name]: {
                    ...currentState,
                    fileName: existingFilePath.split("/").pop() ?? "card-image",
                    filePath: existingFilePath,
                    previewUrl: signedPreviewUrl,
                    status: { state: "success", message: "Current image loaded." },
                  },
                };
              });
            }

            if (existingAudioPath) {
              if (isCancelled) return;

              const signedAudioUrl = createPreviewUrl(existingAudioPath);
              setAudioStates((current) => {
                const currentState = current[card.name];
                if (!currentState || currentState.file) return current;

                return {
                  ...current,
                  [card.name]: {
                    ...currentState,
                    fileName: existingAudioPath.split("/").pop() ?? "card-audio",
                    filePath: existingAudioPath,
                    previewUrl: signedAudioUrl,
                    status: { state: "success", message: "Current audio loaded." },
                  },
                };
              });
            }
          }),
        );
      } catch {
        // Leave cards empty when there is no session yet or storage lookup fails.
      }
    }

    void loadExistingImages();
    return () => {
      isCancelled = true;
    };
  }, [cards]);

  function setCardImageState(cardName: string, nextState: CardImageState) {
    setImageStates((current) => {
      const previous = current[cardName];
      if (previous?.previewUrl?.startsWith("blob:") && previous.previewUrl !== nextState.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      return { ...current, [cardName]: nextState };
    });
  }

  function handleImageSelected(cardName: string, file: File) {
    const validationMessage = validateImageFile(file);
    if (validationMessage) {
      setCardImageState(cardName, {
        file: null,
        fileName: null,
        filePath: null,
        previewUrl: null,
        status: { state: "error", message: validationMessage },
      });
      return;
    }

    setCardImageState(cardName, {
      file,
      fileName: file.name,
      filePath: null,
      previewUrl: URL.createObjectURL(file),
      status: { state: "staged", message: "Ready to upload. Click Upload All when finished." },
    });
  }

  function setCardAudioState(cardName: string, nextState: CardAudioState) {
    setAudioStates((current) => {
      const previous = current[cardName];
      if (previous?.previewUrl?.startsWith("blob:") && previous.previewUrl !== nextState.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      return { ...current, [cardName]: nextState };
    });
  }

  function handleAudioSelected(cardName: string, file: File) {
    const validationMessage = validateAudioFile(file);
    if (validationMessage) {
      setCardAudioState(cardName, {
        file: null,
        fileName: null,
        filePath: null,
        previewUrl: null,
        status: { state: "error", message: validationMessage },
      });
      return;
    }

    setCardAudioState(cardName, {
      file,
      fileName: file.name,
      filePath: null,
      previewUrl: URL.createObjectURL(file),
      status: { state: "staged", message: "Ready to upload. Click Upload All when finished." },
    });
  }

  useEffect(() => {
    async function uploadAllImages() {
      const stagedEntries = cards.filter((card) => {
        const imageState = imageStates[card.name];
        const audioState = audioStates[card.name];
        return (
          !!(imageState?.file && imageState.status.state !== "success") ||
          !!(audioState?.file && audioState.status.state !== "success")
        );
      });

      if (!stagedEntries.length) {
        onUploadAllComplete?.();
        return;
      }

      const storageBasePath = getStorageBasePath();

      for (const card of stagedEntries) {
        const cardName = card.name;
        const imageState = imageStates[cardName];
        const audioState = audioStates[cardName];

        if (imageState?.file && imageState.status.state !== "success") {
          const file = imageState.file;
          const folderPath = `${storageBasePath}/${sanitizeSegment(cardName)}`;
          const filePath = buildImageFilePath(storageBasePath, cardName, file.name);

          setImageStates((current) => ({
            ...current,
            [cardName]: {
              ...current[cardName],
              filePath,
              status: { state: "loading", message: "Uploading image..." },
            },
          }));

          try {
            await removeFolderFilesFromSupabase(folderPath);
            await uploadFileToSupabase(file, filePath, "image/png");
            let thumbnailPath: string | null = null;

            try {
              const thumbnailFile = await createThumbnailImageForUpload(file);
              thumbnailPath = buildThumbnailFilePath(filePath);
              await uploadFileToSupabase(thumbnailFile, thumbnailPath, "image/webp");
            } catch {
              thumbnailPath = null;
            }

            const metadataResult = await upsertImageAssetMetadata({
              section: "shapes",
              itemKey: sanitizeSegment(cardName),
              imagePath: filePath,
              thumbnailPath,
            });
            const signedPreviewUrl = createPreviewUrl(thumbnailPath ?? filePath);

            setImageStates((current) => {
              const previous = current[cardName];
              if (previous.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previous.previewUrl);

              return {
                ...current,
                [cardName]: {
                  ...previous,
                  file: null,
                  fileName: imageState.file?.name ?? previous.fileName,
                  filePath,
                  previewUrl: signedPreviewUrl,
                  status: {
                    state: "success",
                    message: metadataResult.ok
                      ? "Uploaded successfully."
                      : "Image uploaded successfully. Metadata sync failed.",
                  },
                },
              };
            });
          } catch (error) {
            setImageStates((current) => ({
              ...current,
              [cardName]: {
                ...current[cardName],
                filePath,
                status: {
                  state: "error",
                  message: error instanceof Error ? error.message : "Unable to upload image right now.",
                },
              },
            }));
          }
        }

        if (audioState?.file && audioState.status.state !== "success") {
          const filePath = buildAudioFilePath(SUPABASE_AUDIO_FOLDER, cardName, audioState.file.name);
          const folderPath = `${SUPABASE_AUDIO_FOLDER}/${sanitizeSegment(cardName)}`;

          setAudioStates((current) => ({
            ...current,
            [cardName]: {
              ...current[cardName],
              filePath,
              status: { state: "loading", message: "Uploading audio..." },
            },
          }));

          try {
            await removeFolderFilesFromSupabase(folderPath);
            await uploadFileToSupabase(audioState.file, filePath, "audio/mpeg");
            const metadataResult = await upsertAudioAssetMetadata({
              section: "shapes-audio",
              itemKey: sanitizeSegment(cardName),
              audioPath: filePath,
            });
            const signedAudioUrl = createPreviewUrl(filePath);

            setAudioStates((current) => {
              const previous = current[cardName];
              if (previous.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previous.previewUrl);

              return {
                ...current,
                [cardName]: {
                  ...previous,
                  file: null,
                  fileName: audioState.file?.name ?? previous.fileName,
                  filePath,
                  previewUrl: signedAudioUrl,
                  status: {
                    state: "success",
                    message: metadataResult.ok
                      ? "Audio uploaded successfully."
                      : "Audio uploaded successfully. Metadata sync failed.",
                  },
                },
              };
            });
          } catch (error) {
            setAudioStates((current) => ({
              ...current,
              [cardName]: {
                ...current[cardName],
                filePath,
                status: {
                  state: "error",
                  message: error instanceof Error ? error.message : "Unable to upload audio right now.",
                },
              },
            }));
          }
        }
      }

      onUploadAllComplete?.();
    }

    if (uploadAllToken === 0 || uploadAllToken === lastUploadTokenRef.current) return;
    lastUploadTokenRef.current = uploadAllToken;
    void uploadAllImages();
  }, [audioStates, cards, imageStates, onUploadAllComplete, uploadAllToken]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <ShapeCardItem
          key={card.name}
          card={card}
          imageState={imageStates[card.name] ?? createEmptyImageState()}
          audioState={audioStates[card.name] ?? createEmptyAudioState()}
          onImageSelected={handleImageSelected}
          onAudioSelected={handleAudioSelected}
        />
      ))}
    </div>
  );
}
