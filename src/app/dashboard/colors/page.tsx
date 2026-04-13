import type { Metadata } from "next";

import Link from "next/link";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { ColorsManager } from "@/app/dashboard/colors/_components/colors-manager";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";

export const metadata: Metadata = {
  title: "Colors Management - Curated Playground",
  description: "Colors management for Curated Playground.",
};

type ColorCard = {
  name: string;
  family: string;
  hexLabel: string;
  swatchClassName: string;
  contrastClassName: string;
};

const colorCards: ColorCard[] = [
  {
    name: "Red",
    family: "Primary",
    hexLabel: "#EF4444",
    swatchClassName: "bg-red-500",
    contrastClassName: "text-white",
  },
  {
    name: "Orange",
    family: "Warm",
    hexLabel: "#F97316",
    swatchClassName: "bg-orange-500",
    contrastClassName: "text-white",
  },
  {
    name: "Yellow",
    family: "Bright",
    hexLabel: "#FACC15",
    swatchClassName: "bg-yellow-400",
    contrastClassName: "text-slate-900",
  },
  {
    name: "Green",
    family: "Nature",
    hexLabel: "#22C55E",
    swatchClassName: "bg-green-500",
    contrastClassName: "text-white",
  },
  {
    name: "Blue",
    family: "Primary",
    hexLabel: "#3B82F6",
    swatchClassName: "bg-blue-500",
    contrastClassName: "text-white",
  },
  {
    name: "Violet",
    family: "Creative",
    hexLabel: "#8B5CF6",
    swatchClassName: "bg-violet-500",
    contrastClassName: "text-white",
  },
  {
    name: "Pink",
    family: "Playful",
    hexLabel: "#EC4899",
    swatchClassName: "bg-pink-500",
    contrastClassName: "text-white",
  },
  {
    name: "Brown",
    family: "Earth",
    hexLabel: "#92400E",
    swatchClassName: "bg-amber-800",
    contrastClassName: "text-white",
  },
  {
    name: "Black",
    family: "Neutral",
    hexLabel: "#111827",
    swatchClassName: "bg-slate-900",
    contrastClassName: "text-white",
  },
  {
    name: "White",
    family: "Neutral",
    hexLabel: "#F9FAFB",
    swatchClassName: "bg-slate-50",
    contrastClassName: "text-slate-900",
  },
];

export default function ColorsPage() {
  return (
    <DashboardShell activeSection="colors">
      <div className="min-h-screen w-full bg-surface text-on-surface">
        <section className="px-6 py-12 md:px-10">
          <div className="mx-auto max-w-7xl">
            <nav className="mb-10 flex items-center gap-3 font-label text-sm tracking-widest text-on-surface-variant uppercase opacity-60">
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
              <MaterialSymbol name="chevron_right" className="size-[14px]" />
              <span className="font-bold text-on-surface">Colors</span>
            </nav>

            <ColorsManager cards={colorCards} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
