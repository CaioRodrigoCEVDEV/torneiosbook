import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAdminTournaments } from "@/lib/tournament-service";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";
import { logoutAdminAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminTournamentsPage() {
  await requireAdmin();
  const tournaments = await getAdminTournaments();

  return (
    <AdminShell onLogout={logoutAdminAction}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Torneios"
          title="Gerenciar campeonatos"
          description="Crie, edite e abra cada torneio para administrar jogadores e resultados."
          actions={
            <Link href="/admin/torneios/novo" className="arena-button-primary">
              Novo torneio
            </Link>
          }
        />

        {tournaments.length === 0 ? (
          <EmptyState
            title="Nenhum torneio cadastrado"
            description="Crie o primeiro campeonato para começar a gestão no painel."
            action={
              <Link href="/admin/torneios/novo" className="arena-button-primary">
                Criar torneio
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
                    <h2 className="text-lg font-semibold text-slate-900">{tournament.name}</h2>
                    <p className="text-sm leading-6 text-slate-600">{tournament.game}</p>
                  </div>

                  <Link href={`/admin/torneios/${tournament.id}`} className="arena-button-secondary">
                    Abrir
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoRow label="Jogadores" value={String(tournament.playersCount)} />
                  <InfoRow label="Partidas" value={String(tournament.matchesCount)} />
                  <InfoRow label="Finalizadas" value={String(tournament.finishedMatchesCount)} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
