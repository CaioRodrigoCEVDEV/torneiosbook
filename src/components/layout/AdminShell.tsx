import type { ReactNode } from "react";
import { AdminHeader } from "./AdminHeader";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/torneios", label: "Torneios" },
  { href: "/admin/torneios/novo", label: "Novo torneio" },
];

export function AdminShell({ children, onLogout }: { children: ReactNode; onLogout: () => Promise<void> }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader onLogout={onLogout} />
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="arena-card h-fit p-4">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Navegação</div>
          <nav className="flex flex-col gap-2">
            {NAV.map((item) => (
              <Button key={item.href} href={item.href} variant="secondary" className="justify-start">
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
