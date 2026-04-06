import type { Metadata } from "next";

import Link from "next/link";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";
import { PronunciationManager } from "@/app/dashboard/alphabet/pronunciation/_components/pronunciation-manager";

export const metadata: Metadata = {
  title: "Pronunciation Management - Curated Playground",
  description: "Pronunciation management for Curated Playground.",
};

type PronunciationCard = {
  letter: string;
  word: string;
  clipLabel: string;
};

const pronunciationCards: PronunciationCard[] = [
  { letter: "A", word: "Apple", clipLabel: "Letter A" },
  { letter: "B", word: "Ball", clipLabel: "Letter B" },
  { letter: "C", word: "Cat", clipLabel: "Letter C" },
  { letter: "D", word: "Dog", clipLabel: "Letter D" },
  { letter: "E", word: "Egg", clipLabel: "Letter E" },
  { letter: "F", word: "Fish", clipLabel: "Letter F" },
  { letter: "G", word: "Grapes", clipLabel: "Letter G" },
  { letter: "H", word: "Hat", clipLabel: "Letter H" },
  { letter: "I", word: "Igloo", clipLabel: "Letter I" },
  { letter: "J", word: "Jam", clipLabel: "Letter J" },
  { letter: "K", word: "Kite", clipLabel: "Letter K" },
  { letter: "L", word: "Lion", clipLabel: "Letter L" },
  { letter: "M", word: "Moon", clipLabel: "Letter M" },
  { letter: "N", word: "Nest", clipLabel: "Letter N" },
  { letter: "O", word: "Orange", clipLabel: "Letter O" },
  { letter: "P", word: "Pig", clipLabel: "Letter P" },
  { letter: "Q", word: "Queen", clipLabel: "Letter Q" },
  { letter: "R", word: "Rabbit", clipLabel: "Letter R" },
  { letter: "S", word: "Sun", clipLabel: "Letter S" },
  { letter: "T", word: "Turtle", clipLabel: "Letter T" },
  { letter: "U", word: "Umbrella", clipLabel: "Letter U" },
  { letter: "V", word: "Van", clipLabel: "Letter V" },
  { letter: "W", word: "Whale", clipLabel: "Letter W" },
  { letter: "X", word: "Xylophone", clipLabel: "Letter X" },
  { letter: "Y", word: "Yak", clipLabel: "Letter Y" },
  { letter: "Z", word: "Zebra", clipLabel: "Letter Z" },
];

export default function PronunciationPage() {
  return (
    <DashboardShell activeSection="alphabet">
      <div className="min-h-screen w-full bg-surface text-on-surface">
        <section className="px-6 py-12 md:px-10">
          <div className="mx-auto max-w-7xl">
            <nav className="mb-10 flex items-center gap-3 font-label text-sm tracking-widest text-on-surface-variant uppercase opacity-60">
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
              <MaterialSymbol name="chevron_right" className="size-[14px]" />
              <Link
                href="/dashboard/alphabet"
                className="transition-colors hover:text-primary"
              >
                Alphabet
              </Link>
              <MaterialSymbol name="chevron_right" className="size-[14px]" />
              <span className="font-bold text-on-surface">Pronunciation</span>
            </nav>

            <PronunciationManager cards={pronunciationCards} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
