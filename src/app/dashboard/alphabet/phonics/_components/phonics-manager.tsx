"use client";

import { useState } from "react";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { PhonicsUploadGrid } from "@/app/dashboard/alphabet/phonics/_components/phonics-upload-grid";

type PhonicsCard = {
  id: string;
  badge: string;
  label: string;
  pronunciation: string;
  detailHref?: string;
};

type PhonicsManagerProps = {
  cards: PhonicsCard[];
};

export function PhonicsManager({ cards }: PhonicsManagerProps) {
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
            Phonics Management
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            Upload and manage the visual associations for the phonics curriculum.
            Ensure images are high-contrast and child-friendly for the best
            learning experience.
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

      <PhonicsUploadGrid
        cards={cards}
        onPendingImagesChange={setPendingImageCount}
        uploadAllToken={uploadAllToken}
        onUploadAllComplete={() => setIsUploadingAll(false)}
      />
    </>
  );
}
