"use client";

import { useState } from "react";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { NumbersUploadGrid } from "@/app/dashboard/numbers/_components/numbers-upload-grid";

type NumberCard = {
  number: string;
  label: string;
};

type NumbersManagerProps = {
  cards: NumberCard[];
};

export function NumbersManager({ cards }: NumbersManagerProps) {
  const [pendingImageCount, setPendingImageCount] = useState(0);
  const [uploadAllToken, setUploadAllToken] = useState(0);
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  function handleUploadAll() {
    if (!pendingImageCount || isUploadingAll) return;
    setIsUploadingAll(true);
    setUploadAllToken((current) => current + 1);
  }

  return (
    <>
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
            Numbers Management
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            Upload and manage number visuals and counting audio for the learning
            curriculum. Keep assets bright, simple, and child-friendly.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleUploadAll}
            disabled={!pendingImageCount || isUploadingAll}
            className="cursor-pointer flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <MaterialSymbol name="publish" className="size-5" />
            <span>{isUploadingAll ? "Uploading..." : "Upload All"}</span>
          </button>
        </div>
      </div>

      <NumbersUploadGrid
        cards={cards}
        onPendingImagesChange={setPendingImageCount}
        uploadAllToken={uploadAllToken}
        onUploadAllComplete={() => setIsUploadingAll(false)}
      />
    </>
  );
}
