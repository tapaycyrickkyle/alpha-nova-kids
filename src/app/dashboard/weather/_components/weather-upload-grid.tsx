"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const SUPABASE_BUCKET = "card-image";
const SUPABASE_IMAGE_FOLDER = "uploads/images/weather-cards";
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

type WeatherCard = {
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

type AudioUploadState = {
  fileName: string;
  previewUrl: string;
};

type WeatherUploadGridProps = {
  cards: WeatherCard[];
  onPendingImagesChange?: (count: number) => void;
  uploadAllToken?: number;
  onUploadAllComplete?: () => void;
};

function sanitizeSegment(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildImageFilePath(basePath: string, cardName: string, fileName: string) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  return `${basePath}/${sanitizeSegment(cardName)}/card-image.${fileExtension}`;
}

async function getAuthenticatedStorageBasePath() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("You need to be signed in before uploading files.");

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

function createEmptyImageState(): CardImageState {
  return {
    file: null,
    fileName: null,
    filePath: null,
    previewUrl: null,
    status: { state: "idle", message: null },
  };
}

async function createSignedPreviewUrl(filePath: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).createSignedUrl(filePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

async function findExistingImagePath(folderPath: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).list(folderPath, { limit: 100 });
  if (error) throw error;

  const firstFile = (data ?? []).find((file) => file.name && !file.name.endsWith("/"));
  return firstFile ? `${folderPath}/${firstFile.name}` : null;
}

async function uploadImageToSupabase(file: File, filePath: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
}

async function removeImageFromSupabase(folderPath: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).list(folderPath, { limit: 100 });
  if (error) throw error;

  const filePaths = (data ?? []).map((file) => `${folderPath}/${file.name}`);
  if (!filePaths.length) return;

  const { error: removeError } = await supabase.storage.from(SUPABASE_BUCKET).remove(filePaths);
  if (removeError) throw removeError;
}

function WeatherCardItem({
  card,
  imageState,
  onImageSelected,
}: {
  card: WeatherCard;
  imageState: CardImageState;
  onImageSelected: (cardName: string, file: File) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const [audioUpload, setAudioUpload] = useState<AudioUploadState | null>(null);

  useEffect(() => {
    return () => {
      if (audioUpload?.previewUrl) URL.revokeObjectURL(audioUpload.previewUrl);
    };
  }, [audioUpload]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onImageSelected(card.name, file);
    event.target.value = "";
  }

  function handleAudioChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAudioUpload((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return { fileName: file.name, previewUrl: URL.createObjectURL(file) };
    });
  }

  const imageButtonLabel = imageState.previewUrl ? "Replace image" : "Upload image";
  const audioButtonLabel = audioUpload ? "Replace audio" : "Upload audio";

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
              <p className="text-xs text-on-surface-variant">Add a visual reference for this weather lesson.</p>
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
                  <div className="absolute inset-x-4 bottom-4 rounded-full bg-white/90 px-4 py-2 text-center text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
                    {imageState.fileName}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary">
                    <MaterialSymbol name="add_a_photo" className="size-8" />
                  </div>
                  <p className="mt-4 text-lg font-bold text-on-surface">{imageButtonLabel}</p>
                  <p className="mt-1 max-w-[14rem] text-sm text-on-surface-variant">Use a clear child-friendly image for the weather scene.</p>
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
                {imageState.filePath ? <p className="mt-1 break-all opacity-80">{imageState.filePath}</p> : null}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-surface-variant/20 bg-white/70 p-4">
            <div className="mb-4">
              <p className="text-sm font-semibold text-on-surface">Audio</p>
              <p className="text-xs text-on-surface-variant">Upload the MP3 weather pronunciation clip.</p>
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
                audioUpload
                  ? "cursor-pointer bg-primary-container/10 p-4"
                  : "cursor-pointer border border-dashed border-primary/25 bg-primary-container/10 px-5 py-6 text-center"
              }`}
            >
              {audioUpload ? (
                <div className="flex w-full flex-col justify-center gap-3" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                  <div className="inline-flex max-w-full items-center gap-2 self-start rounded-full bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm">
                    <MaterialSymbol name="record_voice_over" className="size-4" />
                    <span className="min-w-0 truncate">{audioUpload.fileName}</span>
                  </div>
                  <audio controls preload="metadata" className="w-full" src={audioUpload.previewUrl}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : (
                <div className="mx-auto flex w-full max-w-[15rem] flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary sm:h-16 sm:w-16">
                    <MaterialSymbol name="record_voice_over" className="size-7" />
                  </div>
                  <p className="mt-4 text-sm font-bold leading-none text-on-surface sm:text-base">{audioButtonLabel}</p>
                  <p className="mt-2 text-xs leading-5 text-on-surface-variant sm:text-sm">
                    Add the spoken pronunciation for {card.name.toLowerCase()}.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-on-surface-variant">
          <span>Image + audio required</span>
          <span className={`shrink-0 rounded-full px-3 py-1 font-semibold ${imageState.previewUrl && audioUpload ? "bg-primary-container/30 text-primary" : "bg-surface text-on-surface-variant"}`}>
            {imageState.previewUrl && audioUpload ? "Ready" : "Incomplete"}
          </span>
        </div>
      </div>
    </>
  );
}

export function WeatherUploadGrid({
  cards,
  onPendingImagesChange,
  uploadAllToken = 0,
  onUploadAllComplete,
}: WeatherUploadGridProps) {
  const [imageStates, setImageStates] = useState<Record<string, CardImageState>>(
    () => Object.fromEntries(cards.map((card) => [card.name, createEmptyImageState()])),
  );
  const lastUploadTokenRef = useRef(uploadAllToken);

  useEffect(() => {
    return () => {
      for (const imageState of Object.values(imageStates)) {
        if (imageState.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(imageState.previewUrl);
      }
    };
  }, [imageStates]);

  const pendingImageCount = useMemo(
    () => Object.values(imageStates).filter((imageState) => imageState.file && imageState.status.state !== "success").length,
    [imageStates],
  );

  useEffect(() => {
    onPendingImagesChange?.(pendingImageCount);
  }, [onPendingImagesChange, pendingImageCount]);

  useEffect(() => {
    let isCancelled = false;

    async function loadExistingImages() {
      try {
        const storageBasePath = await getAuthenticatedStorageBasePath();
        await Promise.all(
          cards.map(async (card) => {
            const folderPath = `${storageBasePath}/${sanitizeSegment(card.name)}`;
            const existingFilePath = await findExistingImagePath(folderPath);
            if (!existingFilePath) return;

            const signedPreviewUrl = await createSignedPreviewUrl(existingFilePath);
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
                  status: { state: "success", message: "Existing image loaded from storage." },
                },
              };
            });
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

  useEffect(() => {
    async function uploadAllImages() {
      const stagedEntries = Object.entries(imageStates).filter(
        ([, imageState]) => imageState.file && imageState.status.state !== "success",
      );

      if (!stagedEntries.length) {
        onUploadAllComplete?.();
        return;
      }

      const storageBasePath = await getAuthenticatedStorageBasePath();

      for (const [cardName, imageState] of stagedEntries) {
        const file = imageState.file;
        if (!file) continue;

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
          await removeImageFromSupabase(folderPath);
          await uploadImageToSupabase(file, filePath);
          const signedPreviewUrl = await createSignedPreviewUrl(filePath);

          setImageStates((current) => {
            const previous = current[cardName];
            if (previous.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previous.previewUrl);

            return {
              ...current,
              [cardName]: {
                ...previous,
                filePath,
                previewUrl: signedPreviewUrl,
                status: { state: "success", message: "Uploaded successfully." },
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

      onUploadAllComplete?.();
    }

    if (uploadAllToken === 0 || uploadAllToken === lastUploadTokenRef.current) return;
    lastUploadTokenRef.current = uploadAllToken;
    void uploadAllImages();
  }, [imageStates, onUploadAllComplete, uploadAllToken]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <WeatherCardItem
          key={card.name}
          card={card}
          imageState={imageStates[card.name] ?? createEmptyImageState()}
          onImageSelected={handleImageSelected}
        />
      ))}
    </div>
  );
}
