import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface AdminHeaderProps {
  onLogout: () => Promise<void>;
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-slate-900 text-sm font-semibold text-white">T</span>
          <div>
            <div className="text-sm font-semibold text-slate-900">Torneios Admin</div>
            <div className="text-xs text-slate-500">Gestão do torneio</div>
          </div>
        </Link>

        <form action={onLogout}>
          <Button type="submit" variant="secondary">Sair</Button>
        </form>
      </div>
    </header>
  );
}
