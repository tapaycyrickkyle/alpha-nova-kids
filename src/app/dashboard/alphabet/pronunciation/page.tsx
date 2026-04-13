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
  id: string;
  badge: string;
  word: string;
  clipLabel: string;
};

const pronunciationCards: PronunciationCard[] = [
  { id: "a", badge: "A", word: "Apple", clipLabel: "Letter A" },
  { id: "b", badge: "B", word: "Ball", clipLabel: "Letter B" },
  { id: "c", badge: "C", word: "Cat", clipLabel: "Letter C" },
  { id: "d", badge: "D", word: "Dog", clipLabel: "Letter D" },
  { id: "e", badge: "E", word: "Egg", clipLabel: "Letter E" },
  { id: "f", badge: "F", word: "Fish", clipLabel: "Letter F" },
  { id: "g", badge: "G", word: "Grapes", clipLabel: "Letter G" },
  { id: "h", badge: "H", word: "Hat", clipLabel: "Letter H" },
  { id: "i", badge: "I", word: "Igloo", clipLabel: "Letter I" },
  { id: "j", badge: "J", word: "Jam", clipLabel: "Letter J" },
  { id: "k", badge: "K", word: "Kite", clipLabel: "Letter K" },
  { id: "l", badge: "L", word: "Lion", clipLabel: "Letter L" },
  { id: "m", badge: "M", word: "Moon", clipLabel: "Letter M" },
  { id: "n", badge: "N", word: "Nest", clipLabel: "Letter N" },
  { id: "o", badge: "O", word: "Orange", clipLabel: "Letter O" },
  { id: "p", badge: "P", word: "Pig", clipLabel: "Letter P" },
  { id: "q", badge: "Q", word: "Queen", clipLabel: "Letter Q" },
  { id: "r", badge: "R", word: "Rabbit", clipLabel: "Letter R" },
  { id: "s", badge: "S", word: "Sun", clipLabel: "Letter S" },
  { id: "t", badge: "T", word: "Turtle", clipLabel: "Letter T" },
  { id: "u", badge: "U", word: "Umbrella", clipLabel: "Letter U" },
  { id: "v", badge: "V", word: "Van", clipLabel: "Letter V" },
  { id: "w", badge: "W", word: "Whale", clipLabel: "Letter W" },
  { id: "x", badge: "X", word: "Xylophone", clipLabel: "Letter X" },
  { id: "y", badge: "Y", word: "Yak", clipLabel: "Letter Y" },
  { id: "z", badge: "Z", word: "Zebra", clipLabel: "Letter Z" },
  {
    id: "pronunciation-button",
    badge: "PB",
    word: "Pronunciation Button",
    clipLabel: "Pronunciation Button",
  },
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
