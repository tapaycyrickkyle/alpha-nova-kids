import type { Metadata } from "next";

import Link from "next/link";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import { BackgroundMusicManager } from "@/app/dashboard/_components/background-music-manager";
import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";

type CategoryCard = {
  title: string;
  description: string;
  icon: "abc" | "palette" | "pin" | "category" | "cloudy" | "extension";
  titleClassName: string;
  accentGlowClassName: string;
  accentIconShellClassName: string;
  accentIconClassName: string;
  href?: string;
};

const categoryCards: CategoryCard[] = [
  {
    title: "Alphabet",
    description: "Manage letters, phonics, and writing guides.",
    icon: "abc",
    titleClassName: "text-primary",
    accentGlowClassName: "bg-primary/5",
    accentIconShellClassName:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
    accentIconClassName: "font-light",
    href: "/dashboard/alphabet",
  },
  {
    title: "Colors",
    description: "Curate color mixing and naming activities.",
    icon: "palette",
    titleClassName: "text-tertiary",
    accentGlowClassName: "bg-tertiary/5",
    accentIconShellClassName:
      "bg-tertiary/10 text-tertiary group-hover:bg-tertiary group-hover:text-white",
    accentIconClassName: "font-light",
    href: "/dashboard/colors",
  },
  {
    title: "Numbers",
    description: "Counting exercises and basic arithmetic tools.",
    icon: "pin",
    titleClassName: "text-emerald-700",
    accentGlowClassName: "bg-emerald-500/5",
    accentIconShellClassName:
      "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
    accentIconClassName: "font-light",
    href: "/dashboard/numbers",
  },
  {
    title: "Menu Buttons",
    description: "Manage the home screen menu button visuals and labels.",
    icon: "extension",
    titleClassName: "text-rose-700",
    accentGlowClassName: "bg-rose-500/5",
    accentIconShellClassName:
      "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500 group-hover:text-white",
    accentIconClassName: "font-light",
    href: "/dashboard/menu-buttons",
  },
  {
    title: "Shapes",
    description: "Geometric recognition and sorting games.",
    icon: "category",
    titleClassName: "text-amber-700",
    accentGlowClassName: "bg-amber-500/5",
    accentIconShellClassName:
      "bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
    accentIconClassName: "font-light",
    href: "/dashboard/shapes",
  },
  {
    title: "Weather",
    description: "Seasonal lessons and daily weather tracking.",
    icon: "cloudy",
    titleClassName: "text-indigo-700",
    accentGlowClassName: "bg-indigo-500/5",
    accentIconShellClassName:
      "bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white",
    accentIconClassName: "font-light",
    href: "/dashboard/weather",
  },
];

export const metadata: Metadata = {
  title: "Curated Playground | Admin Dashboard",
  description: "Admin dashboard for Curated Playground.",
};

function CategoryCard({ card }: { card: CategoryCard }) {
  const className = card.href
    ? "group relative flex h-72 cursor-pointer flex-col items-start justify-between overflow-hidden rounded-[1rem] border border-white/50 bg-white/70 p-8 text-left shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
    : "group relative flex h-72 cursor-not-allowed flex-col items-start justify-between overflow-hidden rounded-[1rem] border border-white/50 bg-white/50 p-8 text-left opacity-70 shadow-sm backdrop-blur-md";

  const content = (
    <>
      <div
        className={`absolute -top-4 -right-4 h-32 w-32 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150 ${card.accentGlowClassName}`}
      />
      <MaterialSymbol
        name={card.icon}
        className="pointer-events-none absolute top-6 -right-3 size-[148px] select-none opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.08]"
      />

      <div
        className={`flex h-20 w-20 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110 ${card.accentIconShellClassName}`}
      >
        <MaterialSymbol
          name={card.icon}
          className={`text-[3.25rem] ${card.accentIconClassName}`}
        />
      </div>

      <div className="relative z-10">
        <h4
          className={`mb-2 font-headline text-[1.75rem] leading-tight font-black tracking-tight ${card.titleClassName}`}
        >
          {card.title}
        </h4>
        <p className="max-w-[15rem] text-sm leading-relaxed font-medium text-slate-500">
          {card.description}
        </p>
      </div>
    </>
  );

  if (card.href) {
    return (
      <Link href={card.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} aria-disabled="true">
      {content}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell activeSection="dashboard">
      <div className="mx-auto w-full max-w-[1760px] space-y-12 p-8 lg:p-12">
        <section>
          <div>
            <h2 className="mb-2 font-headline text-4xl leading-none font-extrabold tracking-tight text-on-surface lg:text-5xl">
              Hello, Admin!
            </h2>
            <p className="max-w-lg text-lg text-on-surface-variant">
              Manage your curriculum and track engagement for your digital curated
              playground.
            </p>
          </div>
        </section>

        <section>
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-headline text-2xl font-bold">Content Categories</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {categoryCards.map((card) => (
              <CategoryCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <BackgroundMusicManager />
      </div>
    </DashboardShell>
  );
}
