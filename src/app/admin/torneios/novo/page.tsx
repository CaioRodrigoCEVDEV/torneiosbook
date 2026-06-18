import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createTournamentAction, logoutAdminAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";

type SearchParamsInput = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

export default async function NewTournamentPage({ searchParams }: { searchParams?: SearchParamsInput }) {
  await requireAdmin();
  const query = await Promise.resolve(searchParams ?? {});
  const message = typeof query.error === "string" ? query.error : "";

  return (
    <AdminShell onLogout={logoutAdminAction}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Novo torneio"
          title="Criar campeonato"
          description="Cadastre um novo torneio para gerenciar jogadores, partidas e mata-mata."
          actions={
            <Link href="/admin/torneios" className="arena-button-secondary">
              Voltar
            </Link>
          }
        />

        <Card className="space-y-6 p-6">
          <form action={createTournamentAction} className="space-y-4">
            <label className="block space-y-2">
              <span className="arena-label">Nome do torneio</span>
              <input name="name" className="arena-input" placeholder="Copa de Verão" />
            </label>

            <label className="block space-y-2">
              <span className="arena-label">Jogo</span>
              <input name="game" className="arena-input" placeholder="EA FC 2026" defaultValue="EA FC 2026" />
            </label>

            <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input name="isPublic" type="checkbox" defaultChecked className="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600" />
              Publicar torneio na vitrine pública
            </label>

            {message ? <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{message}</p> : null}

            <button type="submit" className="arena-button-primary">
              Criar torneio
            </button>
          </form>
        </Card>
      </div>
    </AdminShell>
  );
}
