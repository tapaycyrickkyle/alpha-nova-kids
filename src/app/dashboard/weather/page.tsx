import type { Metadata } from "next";

import Link from "next/link";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";
import { WeatherManager } from "@/app/dashboard/weather/_components/weather-manager";

export const metadata: Metadata = {
  title: "Weather Management - Curated Playground",
  description: "Weather management for Curated Playground.",
};

type WeatherCard = {
  name: string;
  label: string;
};

const weatherCards: WeatherCard[] = [
  { name: "cloudy", label: "Cloudy" },
  { name: "rainy", label: "Rainy" },
  { name: "sunny", label: "Sunny" },
  { name: "windy", label: "Windy" },
  { name: "stormy", label: "Stormy" },
];

export default function WeatherPage() {
  return (
    <DashboardShell activeSection="weather">
      <div className="min-h-screen w-full bg-surface text-on-surface">
        <section className="px-6 py-12 md:px-10">
          <div className="mx-auto max-w-7xl">
            <nav className="mb-10 flex items-center gap-3 font-label text-sm tracking-widest text-on-surface-variant uppercase opacity-60">
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
              <MaterialSymbol name="chevron_right" className="size-[14px]" />
              <span className="font-bold text-on-surface">Weather</span>
            </nav>

            <WeatherManager cards={weatherCards} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
