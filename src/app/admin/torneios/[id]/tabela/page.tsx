import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { TournamentSubnav } from "@/components/layout/TournamentSubnav";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { StandingsTable } from "@/components/championship/StandingsTable";
import { generateKnockoutStageAction, logoutAdminAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";
import { getTournamentContext } from "@/lib/tournament-service";
import { TOURNAMENT_FORMAT_LABELS, TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";

type PageParams = { id: string } | Promise<{ id: string }>;

export default async function AdminTournamentTablePage({ params }: { params: PageParams }) {
  await requireAdmin();
  const { id } = await Promise.resolve(params);
  const context = await getTournamentContext(id, false);

  if (!context) {
    notFound();
  }

  const { tournament, standings, summary, playersById, champion, leagueFinished } = context;
  const hasAnyPlayedMatch = standings.some((standing) => standing.played > 0);

  return (
    <AdminShell onLogout={logoutAdminAction}>
      <div className="mx-auto w-full max-w-6xl space-y-8 py-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_FORMAT_LABELS[tournament.format]}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Tabela</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">Classificação automática para acompanhar o top 4 e liberar o mata-mata.</p>
          </div>

          <TournamentSubnav basePath={`/admin/torneios/${id}`} active="table" includePlayers />
        </section>

        {!hasAnyPlayedMatch ? (
          <EmptyState
            title="Tabela vazia"
            description="A classificação aparece assim que uma partida da fase de grupos for finalizada."
            action={
              <Link href={`/admin/torneios/${id}/partidas`} className="arena-button-primary">
                Ir para partidas
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Líder" value={summary.leader ? playersById[summary.leader.playerId]?.name ?? "—" : "—"} description={summary.leader ? `${summary.leader.points} pontos` : "Sem jogos concluídos"} tone="emerald" />
              <StatCard label="Melhor ataque" value={summary.bestAttack ? playersById[summary.bestAttack.playerId]?.name ?? "—" : "—"} description={summary.bestAttack ? `${summary.bestAttack.goalsFor} gols pró` : "Sem dados suficientes"} tone="blue" />
              <StatCard label="Melhor defesa" value={summary.bestDefense ? playersById[summary.bestDefense.playerId]?.name ?? "—" : "—"} description={summary.bestDefense ? `${summary.bestDefense.goalsAgainst} gols sofridos` : "Sem dados suficientes"} tone="slate" />
              <StatCard label="Campeão" value={champion ? champion.name : "—"} description={champion ? champion.team : "Definido após a final"} tone="amber" />
            </div>

            <StandingsTable standings={standings} playersById={playersById} />

            <div className="rounded-md border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
              Critérios de desempate: pontos, saldo de gols, gols pró e menor número de gols sofridos.
            </div>

            {leagueFinished && tournament.status === "LEAGUE" ? (
              <form action={generateKnockoutStageAction} className="flex flex-col gap-4 rounded-md border border-emerald-200 bg-emerald-50 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="arena-label text-emerald-700">Próxima etapa</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Todas as partidas foram finalizadas</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Gere o mata-mata automaticamente com base no top 4 da tabela.</p>
                </div>

                <input type="hidden" name="tournamentId" value={tournament.id} />
                <button type="submit" className="arena-button-primary">
                  Gerar mata-mata
                </button>
              </form>
            ) : null}
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/torneios/${id}/partidas`} className="arena-button-secondary">
            Ver partidas
          </Link>
          <Link href={`/admin/torneios/${id}/mata-mata`} className="arena-button-primary">
            Ver mata-mata
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
