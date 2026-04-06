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
  letter: string;
  label: string;
  pronunciation: string;
};

const phonicsCards: PhonicsCard[] = [
  { letter: "A", label: "Apple", pronunciation: "/a/ as in Apple" },
  { letter: "B", label: "Ball", pronunciation: "/b/ as in Ball" },
  { letter: "C", label: "Cat", pronunciation: "/k/ as in Cat" },
  { letter: "D", label: "Dog", pronunciation: "/d/ as in Dog" },
  { letter: "E", label: "Egg", pronunciation: "/e/ as in Egg" },
  { letter: "F", label: "Fish", pronunciation: "/f/ as in Fish" },
  { letter: "G", label: "Grapes", pronunciation: "/g/ as in Grapes" },
  { letter: "H", label: "Hat", pronunciation: "/h/ as in Hat" },
  { letter: "I", label: "Igloo", pronunciation: "/i/ as in Igloo" },
  { letter: "J", label: "Jam", pronunciation: "/j/ as in Jam" },
  { letter: "K", label: "Kite", pronunciation: "/k/ as in Kite" },
  { letter: "L", label: "Lion", pronunciation: "/l/ as in Lion" },
  { letter: "M", label: "Moon", pronunciation: "/m/ as in Moon" },
  { letter: "N", label: "Nest", pronunciation: "/n/ as in Nest" },
  { letter: "O", label: "Orange", pronunciation: "/o/ as in Orange" },
  { letter: "P", label: "Pig", pronunciation: "/p/ as in Pig" },
  { letter: "Q", label: "Queen", pronunciation: "/kw/ as in Queen" },
  { letter: "R", label: "Rabbit", pronunciation: "/r/ as in Rabbit" },
  { letter: "S", label: "Sun", pronunciation: "/s/ as in Sun" },
  { letter: "T", label: "Turtle", pronunciation: "/t/ as in Turtle" },
  { letter: "U", label: "Umbrella", pronunciation: "/u/ as in Umbrella" },
  { letter: "V", label: "Van", pronunciation: "/v/ as in Van" },
  { letter: "W", label: "Whale", pronunciation: "/w/ as in Whale" },
  { letter: "X", label: "Xylophone", pronunciation: "/ks/ as in Xylophone" },
  { letter: "Y", label: "Yak", pronunciation: "/y/ as in Yak" },
  { letter: "Z", label: "Zebra", pronunciation: "/z/ as in Zebra" },
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
