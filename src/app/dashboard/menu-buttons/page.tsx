import type { Metadata } from "next";

import Link from "next/link";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";
import { MenuButtonsManager } from "@/app/dashboard/menu-buttons/_components/menu-buttons-manager";

export const metadata: Metadata = {
  title: "Menu Buttons Management - Curated Playground",
  description: "Menu buttons management for Curated Playground.",
};

type HomeMenuCard = {
  name: string;
  label: string;
};

const homeMenuCards: HomeMenuCard[] = [
  { name: "Alphabet", label: "Alphabet" },
  { name: "Colors", label: "Colors" },
  { name: "Numbers", label: "Numbers" },
  { name: "Shapes", label: "Shapes" },
  { name: "Weather", label: "Weather" },
];

export default function HomeMenuButtonPage() {
  return (
    <DashboardShell activeSection="menu-buttons">
      <div className="min-h-screen w-full bg-surface text-on-surface">
        <section className="px-6 py-12 md:px-10">
          <div className="mx-auto max-w-7xl">
            <nav className="mb-10 flex items-center gap-3 font-label text-sm tracking-widest text-on-surface-variant uppercase opacity-60">
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
              <MaterialSymbol name="chevron_right" className="size-[14px]" />
              <span className="font-bold text-on-surface">menu-buttons</span>
            </nav>

            <MenuButtonsManager cards={homeMenuCards} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
