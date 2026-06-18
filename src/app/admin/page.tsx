import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getAdminDashboard } from "@/lib/tournament-service";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";
import { logoutAdminAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const dashboard = await getAdminDashboard();

  return (
    <AdminShell onLogout={logoutAdminAction}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Painel"
          title={`Bem-vindo, ${admin.name}`}
          description="Acompanhe os torneios ativos, conclua resultados e publique campeonatos."
          actions={
            <Link href="/admin/torneios/novo" className="arena-button-primary">
              Novo torneio
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Torneios" value={dashboard.totalTournaments} description="Total cadastrado no sistema." tone="slate" />
          <StatCard label="Em andamento" value={dashboard.inProgressTournaments} description="Em fase de grupos ou mata-mata." tone="emerald" />
          <StatCard label="Finalizados" value={dashboard.finishedTournaments} description="Campeões definidos." tone="amber" />
        </div>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="arena-label">Recentes</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Últimos torneios</h2>
            </div>

            <Link href="/admin/torneios" className="arena-link">
              Ver todos
            </Link>
          </div>

          {dashboard.recentTournaments.length === 0 ? (
            <EmptyState
              title="Nenhum torneio ainda"
              description="Crie o primeiro torneio para começar a gestão no painel admin."
              action={
                <Link href="/admin/torneios/novo" className="arena-button-primary">
                  Criar torneio
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {dashboard.recentTournaments.map((tournament) => (
                <Card key={tournament.id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
                      <h3 className="text-lg font-semibold text-slate-900">{tournament.name}</h3>
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
        </section>
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
