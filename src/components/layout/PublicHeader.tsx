"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function isTournamentsActive(pathname: string) {
  return pathname === "/torneios" || pathname.startsWith("/torneios/");
}

function isAdminActive(pathname: string) {
  return pathname.startsWith("/admin");
}

function navClass(active: boolean) {
  return cn(
    "inline-flex items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2",
    active
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const tournamentsActive = isTournamentsActive(pathname);
  const adminActive = isAdminActive(pathname);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="arena-page flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-emerald-700 text-sm font-semibold text-white">AF</span>
          <div>
            <div className="text-sm font-semibold text-slate-900">Arena FC</div>
            <div className="text-xs text-slate-500">Campeonatos de EA FC</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/torneios" aria-current={tournamentsActive ? "page" : undefined} className={navClass(tournamentsActive)}>
            Torneios
          </Link>
          <Link href="/admin/login" aria-current={adminActive ? "page" : undefined} className={navClass(adminActive)}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
