import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { TournamentSubnav } from "@/components/layout/TournamentSubnav";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { getTournamentContext } from "@/lib/tournament-service";
import { TOURNAMENT_FORMAT_LABELS, TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";

type PageParams = { id: string } | Promise<{ id: string }>;

export default async function TournamentOverviewPage({ params }: { params: PageParams }) {
  const { id } = await Promise.resolve(params);
  const context = await getTournamentContext(id, true);

  if (!context) {
    notFound();
  }

  const { tournament, standings, leader, champion, bestAttack, bestDefense, bestGoalDifference, totalMatches, finishedMatches, pendingMatches } = context;
  const topFour = standings.slice(0, 4);

  return (
    <PublicShell>
      <div className="space-y-8 py-8">
        <section className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
              <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_FORMAT_LABELS[tournament.format]}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{tournament.name}</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">{tournament.game}</p>
            </div>
          </div>

          <TournamentSubnav basePath={`/torneios/${id}`} active="overview" />
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Jogadores" value={tournament.players.length} description="Elenco fechado de 6 competidores." tone="slate" />
          <StatCard label="Partidas" value={totalMatches} description={`${finishedMatches} finalizadas e ${pendingMatches} pendentes.`} tone="emerald" />
          <StatCard label="Líder" value={leader ? leader.name : "—"} description={leader ? leader.team : "Sem jogos concluídos"} tone="blue" />
          <StatCard label="Campeão" value={champion ? champion.name : "—"} description={champion ? champion.team : "Definido após a final"} tone="amber" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="space-y-4 p-6">
            <div>
              <p className="arena-label">Resumo</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Situação do torneio</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Melhor ataque" value={bestAttack ? bestAttack.name : "—"} />
              <InfoRow label="Melhor defesa" value={bestDefense ? bestDefense.name : "—"} />
              <InfoRow label="Maior saldo" value={bestGoalDifference ? bestGoalDifference.name : "—"} />
              <InfoRow label="Total de partidas" value={String(totalMatches)} />
            </div>

            <p className="text-sm leading-6 text-slate-600">
              Acompanhe a tabela, as partidas e o mata-mata pelas abas acima.
            </p>
          </Card>

          <Card className="space-y-4 p-6">
            <div>
              <p className="arena-label">Top 4</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Classificados provisórios</h2>
            </div>

            <div className="space-y-3">
              {topFour.length === 0 ? (
                <p className="text-sm leading-6 text-slate-600">A classificação aparece assim que as primeiras partidas forem finalizadas.</p>
              ) : (
                topFour.map((standing, index) => {
                  const player = context.playersById[standing.playerId];

                  return (
                    <div key={standing.playerId} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {index + 1}º {player?.name ?? "Jogador"}
                        </p>
                        <p className="text-xs text-slate-500">{player?.team ?? "—"}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{standing.points} pts</span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/torneios/${id}/tabela`} className="arena-button-secondary">
            Ver tabela
          </Link>
          <Link href={`/torneios/${id}/partidas`} className="arena-button-primary">
            Ver partidas
          </Link>
        </div>
      </div>
    </PublicShell>
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
