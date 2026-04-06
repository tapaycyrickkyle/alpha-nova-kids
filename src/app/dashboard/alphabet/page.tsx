import type { Metadata } from "next";

import Image from "next/image";
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
  imageSrc: string;
  imageAlt: string;
  accentClassName: string;
  icon: "record_voice_over" | "auto_stories";
  statLabel: string;
  statClassName: string;
  buttonLabel: string;
  buttonClassName: string;
  href?: string;
};

const carouselCards: CarouselCard[] = [
  {
    title: "Alphabet Pronunciation",
    description:
      "Manage A-Z sound files. Ensure clear, high-fidelity audio recordings for every letter in multiple languages and dialects.",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBB6rJva7c4SNM0xGID8kc6FYsSnetXz5niqVjDIPvgCBX81c_bKMceHniLbB70UP4u0lWWOzum1VzbPc_B5_jPe88YHWlad_ldXhOYT3I87i6aPkeScaomF6FEEPdJSOe3ylUZ2gMNOlCcFU0URV0GS3RmNxwtxhG_Y2XeOfPh8DeSbNmzdz6H94cR_TsJe1idhtCbB9yawO-BDUl5p8oMLdjkWhbuKy555veU3hTr3_1QKFDaL2IEfX5A8frgCor06JRFAuWsvx7m",
    imageAlt: "Alphabet Pronunciation",
    accentClassName: "bg-primary text-on-primary",
    icon: "record_voice_over",
    statLabel: "26 Active Files",
    statClassName: "bg-primary-container/20 text-primary",
    buttonLabel: "Edit",
    buttonClassName: "text-primary",
    href: "/dashboard/alphabet/pronunciation",
  },
  {
    title: "Phonics Imagery",
    description:
      "Manage phonics imagery. Curate the library of high-resolution visual cues and illustrations used for interactive letter discovery.",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw9jdJMhq65Ak7R72ZsBjouviEd8kqHYi80dZTag3HcxtDjRscxcppHNUZiOm53cBCaAM5YXu8OFywaKucGUlMI56KHK6sBoAQjxO7Qjr2AF2BvSfZyxt_oHsF66lk4gYj0BmXyGXi87j2gqiGhUj9IHCL2a3p4W_lbViGUwYi2z6lBrufgTJcNYv0ZXioifV9IqDE_x0RT3zih76mkCPqug2LXHNcyJaAQWuO_PTiPKtmNpOxxPHR1uZCggZ0QYuAeN_JYo9cREiT",
    imageAlt: "Phonics Management",
    accentClassName: "bg-tertiary text-on-tertiary",
    icon: "auto_stories",
    statLabel: "142 Assets",
    statClassName: "bg-tertiary-container/20 text-tertiary",
    buttonLabel: "Edit",
    buttonClassName: "text-tertiary",
    href: "/dashboard/alphabet/phonics",
  },
];

function CarouselCardView({ card }: { card: CarouselCard }) {
  return (
    <div className="group/card relative overflow-hidden rounded-lg bg-surface-container-lowest shadow-[0px_20px_40px_rgba(44,47,49,0.06)] transition-all hover:-translate-y-2 hover:shadow-[0px_40px_80px_rgba(0,88,186,0.1)]">
      <div className="relative h-56">
        <Image
          src={card.imageSrc}
          alt={card.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover grayscale-[20%] transition-all duration-500 group-hover/card:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent opacity-80" />
        <div className="absolute bottom-6 left-8 flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl ${card.accentClassName}`}
          >
            <MaterialSymbol name={card.icon} filled className="size-7" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="mb-3 font-headline text-2xl font-bold text-on-surface">
          {card.title}
        </h3>
        <p className="mb-6 leading-relaxed text-on-surface-variant">{card.description}</p>
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full px-4 py-2 font-label text-sm font-bold ${card.statClassName}`}
          >
            {card.statLabel}
          </span>
          {card.href ? (
            <Link
              href={card.href}
              className={`group/btn flex cursor-pointer items-center gap-2 font-bold ${card.buttonClassName}`}
            >
              <span>{card.buttonLabel}</span>
              <MaterialSymbol
                name="arrow_forward"
                className="size-5 transition-transform group-hover/btn:translate-x-1"
              />
            </Link>
          ) : (
            <button
              className={`group/btn flex cursor-pointer items-center gap-2 font-bold ${card.buttonClassName}`}
            >
              <span>{card.buttonLabel}</span>
              <MaterialSymbol
                name="arrow_forward"
                className="size-5 transition-transform group-hover/btn:translate-x-1"
              />
            </button>
          )}
        </div>
      </div>
    </div>
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
