"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-600 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20">
            AF
          </span>

          <div>
            <div className="text-lg font-black tracking-wide text-white">Arena FC</div>
            <div className="text-xs text-zinc-400">MVP local</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="arena-badge border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
            Base localStorage
          </span>
        </div>

        <nav className="flex w-full items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1 sm:max-w-full lg:max-w-none">
          {NAV_LINKS.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition",
                  active ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-zinc-300 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
