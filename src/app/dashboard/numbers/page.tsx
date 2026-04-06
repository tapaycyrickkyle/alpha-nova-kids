import type { Metadata } from "next";

import Link from "next/link";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";
import { NumbersManager } from "@/app/dashboard/numbers/_components/numbers-manager";

export const metadata: Metadata = {
  title: "Numbers Management - Curated Playground",
  description: "Numbers management for Curated Playground.",
};

type NumberCard = {
  number: string;
  label: string;
};

const numberCards: NumberCard[] = [
  ...Array.from({ length: 101 }, (_, index) => {
    const number = String(index);

    return {
      number,
      label: `Number ${number}`,
    };
  }),
];

export default function NumbersPage() {
  return (
    <DashboardShell activeSection="numbers">
      <div className="min-h-screen w-full bg-surface text-on-surface">
        <section className="px-6 py-12 md:px-10">
          <div className="mx-auto max-w-7xl">
            <nav className="mb-10 flex items-center gap-3 font-label text-sm tracking-widest text-on-surface-variant uppercase opacity-60">
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
              <MaterialSymbol name="chevron_right" className="size-[14px]" />
              <span className="font-bold text-on-surface">Numbers</span>
            </nav>

            <NumbersManager cards={numberCards} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
