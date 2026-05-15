"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, LineChart, Mic2, PenLine, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/speaking", label: "Speaking", icon: Mic2 },
  { href: "/writing", label: "Writing", icon: PenLine },
  { href: "/vocab", label: "Vocab", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: LineChart },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark() {
  return (
    <Link href="/" className="flex min-h-[44px] items-center gap-3 rounded-2xl premium-focus">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-black text-white shadow-soft">
        EH
      </div>
      <div className="leading-tight">
        <p className="text-sm font-extrabold tracking-tight text-ink">EnglishHub SMA</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">AI TOEFL Studio</p>
      </div>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-white/82 px-5 py-6 shadow-soft backdrop-blur-xl lg:block">
        <BrandMark />
        <nav className="mt-8 flex flex-col gap-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex min-h-[46px] items-center gap-3 rounded-2xl px-3 text-sm transition-all duration-200 premium-focus",
                  active
                    ? "bg-ink text-white shadow-soft"
                    : "text-secondary hover:bg-surface-2 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
                <span className="font-semibold">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-5 right-5 rounded-3xl border border-line bg-surface-2 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Daily Focus</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-ink">Practice one answer, improve one thing, repeat.</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-line bg-white/82 px-4 py-3 shadow-soft backdrop-blur-xl lg:hidden">
        <BrandMark />
      </header>

      <div className="lg:pl-72">{children}</div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-3xl border border-line bg-white/92 p-2 shadow-premium backdrop-blur-xl lg:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[50px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition-all premium-focus",
                active ? "bg-ink text-white" : "text-muted hover:bg-surface-2 hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
