import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";
import { PhonicsLetterDetailManager } from "@/app/dashboard/alphabet/phonics/_components/phonics-letter-detail-manager";

const alphabetLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const letterCards = [
  { id: "letter-pronunciation", title: "Letter Pronunciation" },
  { id: "example-1", title: "Example 1" },
  { id: "example-2", title: "Example 2" },
];

type LetterPageProps = {
  params: Promise<{ letter: string }>;
};

export async function generateStaticParams() {
  return alphabetLetters.map((letter) => ({
    letter: letter.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: LetterPageProps): Promise<Metadata> {
  const { letter } = await params;
  const normalizedLetter = letter.toUpperCase();

  if (!alphabetLetters.includes(normalizedLetter)) {
    return {
      title: "Letter Not Found - Curated Playground",
    };
  }

  return {
    title: `Letter ${normalizedLetter} Phonics - Curated Playground`,
    description: `Phonics content management for letter ${normalizedLetter}.`,
  };
}

export default async function PhonicsLetterPage({ params }: LetterPageProps) {
  const { letter } = await params;
  const normalizedLetter = letter.toUpperCase();

  if (!alphabetLetters.includes(normalizedLetter)) {
    notFound();
  }

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
              <Link
                href="/dashboard/alphabet/phonics"
                className="transition-colors hover:text-primary"
              >
                Phonics
              </Link>
              <MaterialSymbol name="chevron_right" className="size-[14px]" />
              <span className="font-bold text-on-surface">Letter {normalizedLetter}</span>
            </nav>

            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.3em] text-primary uppercase">
                  Letter Detail
                </p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                  Phonics Letter {normalizedLetter}
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                  Manage the upload cards for letter {normalizedLetter}. Each section
                  follows the same style as the main phonics cards, with image and
                  audio uploads.
                </p>
              </div>

              <Link
                href="/dashboard/alphabet/phonics"
                className="inline-flex items-center gap-2 self-start rounded-full border border-surface-variant/20 bg-surface-container-lowest px-5 py-3 font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
              >
                <MaterialSymbol name="arrow_back" className="size-5" />
                Back to phonics
              </Link>
            </div>

            <PhonicsLetterDetailManager
              letter={normalizedLetter}
              cards={letterCards}
            />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
