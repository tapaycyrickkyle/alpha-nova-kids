"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  MaterialSymbol,
  type SymbolName,
} from "@/app/_components/material-symbol";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type DashboardSection =
  | "dashboard"
  | "menu-buttons"
  | "alphabet"
  | "colors"
  | "numbers"
  | "shapes"
  | "weather";

type NavItem = {
  label: string;
  icon: SymbolName;
  href?: string;
  section: DashboardSection;
};

type DashboardShellProps = {
  activeSection: DashboardSection;
  children: ReactNode;
};

const sidebarItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: "dashboard",
    href: "/dashboard",
    section: "dashboard",
  },
  {
    label: "Menu Buttons",
    icon: "extension",
    href: "/dashboard/menu-buttons",
    section: "menu-buttons",
  },
  {
    label: "Alphabet",
    icon: "abc",
    href: "/dashboard/alphabet",
    section: "alphabet",
  },
  {
    label: "Colors",
    icon: "palette",
    href: "/dashboard/colors",
    section: "colors",
  },
  {
    label: "Numbers",
    icon: "pin",
    href: "/dashboard/numbers",
    section: "numbers",
  },
  {
    label: "Shapes",
    icon: "category",
    href: "/dashboard/shapes",
    section: "shapes",
  },
  {
    label: "Weather",
    icon: "cloudy",
    href: "/dashboard/weather",
    section: "weather",
  },
];

const mobileItems: Array<{
  label: string;
  icon: Extract<SymbolName, "dashboard" | "abc" | "bar_chart" | "person">;
  href?: string;
  activeFor: DashboardSection[];
}> = [
  {
    label: "Dashboard",
    icon: "dashboard",
    href: "/dashboard",
    activeFor: ["dashboard"],
  },
  {
    label: "Alphabet",
    icon: "abc",
    href: "/dashboard/alphabet",
    activeFor: ["alphabet"],
  },
  {
    label: "Stats",
    icon: "bar_chart",
    activeFor: [],
  },
  {
    label: "Profile",
    icon: "person",
    activeFor: [],
  },
];

function SidebarLink({
  item,
  activeSection,
}: {
  item: NavItem;
  activeSection: DashboardSection;
}) {
  const isActive = item.section === activeSection;
  const className = isActive
    ? "mx-2 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-blue-700 shadow-sm transition-all duration-150 active:scale-[0.98]"
    : "mx-2 flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-all duration-150 hover:bg-white/50 active:scale-[0.98]";

  if (!item.href) {
    return (
      <span
        className={`${className} cursor-not-allowed opacity-50`}
        aria-disabled="true"
      >
        <MaterialSymbol name={item.icon} className="size-6 shrink-0" />
        <span className="min-w-0 flex-1 leading-tight">{item.label}</span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-current={isActive ? "page" : undefined}
    >
      <MaterialSymbol name={item.icon} className="size-6 shrink-0" />
      <span className="min-w-0 flex-1 leading-tight">{item.label}</span>
    </Link>
  );
}

function Sidebar({
  activeSection,
  onLogout,
  isLoggingOut,
}: {
  activeSection: DashboardSection;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col gap-2 overflow-y-auto bg-slate-100 py-6 font-body text-sm font-medium md:flex">
      <div className="mb-8 px-8">
        <h1 className="font-headline text-lg font-black text-blue-800">
          Alpha Nova Kids
        </h1>
        <p className="mt-1 text-xs font-medium tracking-wide text-black">
          Admin Portal
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {sidebarItems.map((item) => (
          <SidebarLink
            key={item.label}
            item={item}
            activeSection={activeSection}
          />
        ))}
      </nav>

      <div className="mt-auto px-2">
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="mx-4 mt-4 flex w-[calc(100%-2rem)] cursor-pointer items-center justify-center rounded-DEFAULT border border-error/10 bg-white py-3 text-sm font-semibold text-error shadow-sm transition-all hover:-translate-y-0.5 hover:bg-error/5 hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ activeSection }: { activeSection: DashboardSection }) {
  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t border-surface-variant/20 bg-white/90 px-4 py-3 backdrop-blur-lg md:hidden">
      {mobileItems.map((item) => {
        const isActive = item.activeFor.includes(activeSection);
        const className = isActive
          ? "flex flex-col items-center gap-1 text-blue-700"
          : "flex flex-col items-center gap-1 text-slate-500";

        if (!item.href) {
          return (
            <span
              key={item.label}
              className={`${className} cursor-not-allowed opacity-50`}
              aria-disabled="true"
            >
              <MaterialSymbol name={item.icon} className="size-6" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </span>
          );
        }

        return (
          <Link key={item.label} href={item.href} className={className}>
            <MaterialSymbol name={item.icon} className="size-6" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  activeSection,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    let isMounted = true;

    async function verifySession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error || !data.session) {
        router.replace("/");
        return;
      }

      setIsCheckingSession(false);
    }

    void verifySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/");
        return;
      }

      setIsCheckingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-10 text-on-surface">
        <div className="rounded-2xl bg-white/80 px-6 py-4 text-sm font-semibold shadow-sm">
          Checking session...
        </div>
      </main>
    );
  }

  return (
    <>
      <Sidebar
        activeSection={activeSection}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="relative flex min-h-screen flex-col md:ml-64">
        {children}

        <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-transparent px-12 py-8 text-on-surface-variant md:flex-row">
          <span className="text-sm">2026 Alpha Nova Kids</span>
        </footer>
      </main>

      <MobileNav activeSection={activeSection} />
    </>
  );
}
