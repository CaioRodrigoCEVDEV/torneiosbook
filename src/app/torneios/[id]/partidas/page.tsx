import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchSummaryCard } from "@/components/tournaments/MatchSummaryCard";
import { PublicShell } from "@/components/layout/PublicShell";
import { TournamentSubnav } from "@/components/layout/TournamentSubnav";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { getTournamentContext } from "@/lib/tournament-service";
import { TOURNAMENT_FORMAT_LABELS, TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";

type PageParams = { id: string } | Promise<{ id: string }>;

export default async function TournamentMatchesPage({ params }: { params: PageParams }) {
  const { id } = await Promise.resolve(params);
  const context = await getTournamentContext(id, true);

  if (!context) {
    notFound();
  }

  const { tournament, leagueMatchesByRound, leagueMatches, playersById, leagueFinished } = context;
  const roundNumbers = Object.keys(leagueMatchesByRound).map(Number).sort((left, right) => left - right);
  const finishedMatches = leagueMatches.filter((match) => match.status === "FINISHED").length;
  const pendingMatches = leagueMatches.length - finishedMatches;

  return (
    <PublicShell>
      <div className="space-y-8 py-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_FORMAT_LABELS[tournament.format]}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Partidas</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">Acompanhe os resultados da fase de grupos rodada por rodada.</p>
          </div>

          <TournamentSubnav basePath={`/torneios/${id}`} active="matches" />
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Rodadas" value={roundNumbers.length} description="Cinco rodadas na fase de grupos." tone="slate" />
          <StatCard label="Finalizadas" value={finishedMatches} description="Resultados já confirmados." tone="emerald" />
          <StatCard label="Pendentes" value={pendingMatches} description="Partidas ainda sem placar." tone="amber" />
        </div>

        {!leagueMatches.length ? (
          <EmptyState
            title="Nenhuma partida gerada"
            description="A fase de grupos aparece aqui depois que o torneio gerar os confrontos no painel admin."
            action={
              <Link href={`/torneios/${id}`} className="arena-button-primary">
                Ver visão geral
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {roundNumbers.map((roundNumber) => {
              const roundMatches = leagueMatchesByRound[roundNumber] ?? [];

              return (
                <section key={roundNumber} className="space-y-4">
                  <div>
                    <p className="arena-label">Rodada {roundNumber}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{roundMatches.length} partidas</h2>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {roundMatches.map((match, index) => (
                      <MatchSummaryCard
                        key={match.id}
                        match={match}
                        title={`Confronto ${index + 1}`}
                        subtitle={`Rodada ${roundNumber}`}
                        homePlayer={playersById[match.homePlayerId]}
                        awayPlayer={playersById[match.awayPlayerId]}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {leagueFinished ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
            Todas as partidas da fase de grupos foram finalizadas. O mata-mata já pode estar disponível na aba correspondente.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link href={`/torneios/${id}/tabela`} className="arena-button-secondary">
            Ver tabela
          </Link>
          <Link href={`/torneios/${id}/mata-mata`} className="arena-button-primary">
            Ver mata-mata
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
