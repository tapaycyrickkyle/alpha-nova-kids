import type { Metadata } from "next";

import Link from "next/link";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";
import { ShapesManager } from "@/app/dashboard/shapes/_components/shapes-manager";

export const metadata: Metadata = {
  title: "Shapes Management - Curated Playground",
  description: "Shapes management for Curated Playground.",
};

type ShapeCard = {
  name: string;
  label: string;
};

const shapeCards: ShapeCard[] = [
  { name: "circle", label: "Circle" },
  { name: "diamond", label: "Diamond" },
  { name: "heart", label: "Heart" },
  { name: "oval", label: "Oval" },
  { name: "rectangle", label: "Rectangle" },
  { name: "square", label: "Square" },
  { name: "star", label: "Star" },
  { name: "triangle", label: "Triangle" },
];

export default function ShapesPage() {
  return (
    <DashboardShell activeSection="shapes">
      <div className="min-h-screen w-full bg-surface text-on-surface">
        <section className="px-6 py-12 md:px-10">
          <div className="mx-auto max-w-7xl">
            <nav className="mb-10 flex items-center gap-3 font-label text-sm tracking-widest text-on-surface-variant uppercase opacity-60">
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
              <MaterialSymbol name="chevron_right" className="size-[14px]" />
              <span className="font-bold text-on-surface">Shapes</span>
            </nav>

            <ShapesManager cards={shapeCards} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
