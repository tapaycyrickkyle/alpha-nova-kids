import type { Metadata } from "next";

import Link from "next/link";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";

export const metadata: Metadata = {
  title: "Alphabet Management - Curated Playground",
  description: "Alphabet curriculum management for Curated Playground.",
};

type CarouselCard = {
  title: string;
  description: string;
  href: string;
};

const carouselCards: CarouselCard[] = [
  {
    title: "Alphabet Pronunciation",
    description:
      "Manage A-Z sound files. Ensure clear, high-fidelity audio recordings for every letter in multiple languages and dialects.",
    href: "/dashboard/alphabet/pronunciation",
  },
  {
    title: "Phonics Imagery",
    description:
      "Manage phonics imagery. Curate the library of high-resolution visual cues and illustrations used for interactive letter discovery.",
    href: "/dashboard/alphabet/phonics",
  },
];

function CarouselCardView({ card }: { card: CarouselCard }) {
  return (
    <Link
      href={card.href}
      className="group/card relative flex h-full flex-col rounded-lg border-2 border-transparent bg-surface-container-lowest px-5 py-5 shadow-[0px_20px_40px_rgba(44,47,49,0.06)] transition-all hover:-translate-y-2 hover:border-primary hover:shadow-[0px_40px_80px_rgba(0,88,186,0.1)] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim sm:px-6 sm:py-6 md:px-7 md:py-7"
    >
      <MaterialSymbol
        name="arrow_forward"
        className="absolute top-5 right-5 size-5 text-on-surface-variant transition-transform group-hover/card:translate-x-1 sm:top-6 sm:right-6 md:top-7 md:right-7"
      />
      <div className="space-y-2 sm:space-y-3">
        <h3 className="font-headline text-xl font-bold leading-tight text-on-surface sm:text-2xl">
          {card.title}
        </h3>
        <p className="text-sm leading-6 text-on-surface-variant sm:text-base sm:leading-7">
          {card.description}
        </p>
      </div>
    </Link>
  );
}

export default function AlphabetPage() {
  return (
    <DashboardShell activeSection="alphabet">
      <div className="mx-auto flex-1 w-full max-w-7xl px-8 py-10">
        <nav className="mb-10 flex items-center gap-3 font-label text-sm tracking-widest text-on-surface-variant uppercase opacity-60">
          <Link href="/dashboard" className="transition-colors hover:text-primary">
            Dashboard
          </Link>
          <MaterialSymbol name="chevron_right" className="size-[14px]" />
          <span className="font-bold text-on-surface">Alphabet</span>
        </nav>

        <div className="mb-16">
          <h2 className="mb-4 font-headline text-5xl font-extrabold tracking-tight text-on-surface">
            Alphabet Curriculum
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            Manage the foundational linguistic building blocks. Update audio
            pronunciation files and visual phonics assets to ensure the highest
            quality educational experience.
          </p>
        </div>

        <div className="group relative">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {carouselCards.map((card) => (
              <CarouselCardView key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
