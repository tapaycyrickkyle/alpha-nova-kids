import type { Metadata } from "next";

import Link from "next/link";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";
import { PhonicsManager } from "@/app/dashboard/alphabet/phonics/_components/phonics-manager";

export const metadata: Metadata = {
  title: "Phonics Management - Curated Playground",
  description: "Phonics management for Curated Playground.",
};

type PhonicsCard = {
  id: string;
  badge: string;
  label: string;
  pronunciation: string;
  detailHref?: string;
};

const phonicsCards: PhonicsCard[] = [
  { id: "a", badge: "A", label: "Apple", pronunciation: "/a/ as in Apple", detailHref: "/dashboard/alphabet/phonics/a" },
  { id: "b", badge: "B", label: "Ball", pronunciation: "/b/ as in Ball", detailHref: "/dashboard/alphabet/phonics/b" },
  { id: "c", badge: "C", label: "Cat", pronunciation: "/k/ as in Cat", detailHref: "/dashboard/alphabet/phonics/c" },
  { id: "d", badge: "D", label: "Dog", pronunciation: "/d/ as in Dog", detailHref: "/dashboard/alphabet/phonics/d" },
  { id: "e", badge: "E", label: "Egg", pronunciation: "/e/ as in Egg", detailHref: "/dashboard/alphabet/phonics/e" },
  { id: "f", badge: "F", label: "Fish", pronunciation: "/f/ as in Fish", detailHref: "/dashboard/alphabet/phonics/f" },
  { id: "g", badge: "G", label: "Grapes", pronunciation: "/g/ as in Grapes", detailHref: "/dashboard/alphabet/phonics/g" },
  { id: "h", badge: "H", label: "Hat", pronunciation: "/h/ as in Hat", detailHref: "/dashboard/alphabet/phonics/h" },
  { id: "i", badge: "I", label: "Igloo", pronunciation: "/i/ as in Igloo", detailHref: "/dashboard/alphabet/phonics/i" },
  { id: "j", badge: "J", label: "Jam", pronunciation: "/j/ as in Jam", detailHref: "/dashboard/alphabet/phonics/j" },
  { id: "k", badge: "K", label: "Kite", pronunciation: "/k/ as in Kite", detailHref: "/dashboard/alphabet/phonics/k" },
  { id: "l", badge: "L", label: "Lion", pronunciation: "/l/ as in Lion", detailHref: "/dashboard/alphabet/phonics/l" },
  { id: "m", badge: "M", label: "Moon", pronunciation: "/m/ as in Moon", detailHref: "/dashboard/alphabet/phonics/m" },
  { id: "n", badge: "N", label: "Nest", pronunciation: "/n/ as in Nest", detailHref: "/dashboard/alphabet/phonics/n" },
  { id: "o", badge: "O", label: "Orange", pronunciation: "/o/ as in Orange", detailHref: "/dashboard/alphabet/phonics/o" },
  { id: "p", badge: "P", label: "Pig", pronunciation: "/p/ as in Pig", detailHref: "/dashboard/alphabet/phonics/p" },
  { id: "q", badge: "Q", label: "Queen", pronunciation: "/kw/ as in Queen", detailHref: "/dashboard/alphabet/phonics/q" },
  { id: "r", badge: "R", label: "Rabbit", pronunciation: "/r/ as in Rabbit", detailHref: "/dashboard/alphabet/phonics/r" },
  { id: "s", badge: "S", label: "Sun", pronunciation: "/s/ as in Sun", detailHref: "/dashboard/alphabet/phonics/s" },
  { id: "t", badge: "T", label: "Turtle", pronunciation: "/t/ as in Turtle", detailHref: "/dashboard/alphabet/phonics/t" },
  { id: "u", badge: "U", label: "Umbrella", pronunciation: "/u/ as in Umbrella", detailHref: "/dashboard/alphabet/phonics/u" },
  { id: "v", badge: "V", label: "Van", pronunciation: "/v/ as in Van", detailHref: "/dashboard/alphabet/phonics/v" },
  { id: "w", badge: "W", label: "Whale", pronunciation: "/w/ as in Whale", detailHref: "/dashboard/alphabet/phonics/w" },
  { id: "x", badge: "X", label: "Xylophone", pronunciation: "/ks/ as in Xylophone", detailHref: "/dashboard/alphabet/phonics/x" },
  { id: "y", badge: "Y", label: "Yak", pronunciation: "/y/ as in Yak", detailHref: "/dashboard/alphabet/phonics/y" },
  { id: "z", badge: "Z", label: "Zebra", pronunciation: "/z/ as in Zebra", detailHref: "/dashboard/alphabet/phonics/z" },
  { id: "phonics-button", badge: "PB", label: "Phonics Button", pronunciation: "Main phonics button" },
];

export default function PhonicsPage() {
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
              <span className="font-bold text-on-surface">Phonics</span>
            </nav>

            <PhonicsManager cards={phonicsCards} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
