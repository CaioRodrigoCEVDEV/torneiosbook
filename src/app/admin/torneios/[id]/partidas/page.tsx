import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { TournamentSubnav } from "@/components/layout/TournamentSubnav";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { clearLeagueMatchResultAction, generateKnockoutStageAction, logoutAdminAction, saveLeagueMatchResultAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";
import { getTournamentContext } from "@/lib/tournament-service";
import { MATCH_STATUS_LABELS, TOURNAMENT_FORMAT_LABELS, TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";
import type { Match, Player } from "@/lib/tournament-types";

type PageParams = { id: string } | Promise<{ id: string }>;
type SearchParamsInput = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

export default async function AdminTournamentMatchesPage({ params, searchParams }: { params: PageParams; searchParams?: SearchParamsInput }) {
  await requireAdmin();
  const { id } = await Promise.resolve(params);
  const query = await Promise.resolve(searchParams ?? {});
  const context = await getTournamentContext(id, false);

  if (!context) {
    notFound();
  }

  const { tournament, leagueMatchesByRound, leagueMatches, playersById, leagueFinished } = context;
  const roundNumbers = Object.keys(leagueMatchesByRound).map(Number).sort((left, right) => left - right);
  const finishedMatches = leagueMatches.filter((match) => match.status === "FINISHED").length;
  const pendingMatches = leagueMatches.length - finishedMatches;
  const locked = tournament.status === "KNOCKOUT" || tournament.status === "FINISHED";
  const canGenerateKnockout = leagueFinished && tournament.status === "LEAGUE";
  const message = typeof query.error === "string" ? query.error : "";

  return (
    <AdminShell onLogout={logoutAdminAction}>
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_FORMAT_LABELS[tournament.format]}</span>
            <span className={locked ? "arena-badge border-amber-200 bg-amber-50 text-amber-700" : "arena-badge bg-slate-100 text-slate-700"}>
              {locked ? "Resultados travados" : "Resultados abertos"}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Partidas</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">Registre os placares da fase de grupos e libere o mata-mata quando terminar.</p>
          </div>

          <TournamentSubnav basePath={`/admin/torneios/${id}`} active="matches" includePlayers />
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Rodadas" value={roundNumbers.length} description="Cinco rodadas na fase de grupos." tone="slate" />
          <StatCard label="Finalizadas" value={finishedMatches} description="Resultados já confirmados." tone="emerald" />
          <StatCard label="Pendentes" value={pendingMatches} description="Partidas aguardando placar." tone="amber" />
        </div>

        {message ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{message}</div> : null}

        {locked ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            Os resultados da fase de grupos ficam travados depois que o mata-mata é gerado.
          </div>
        ) : null}

        {!leagueMatches.length ? (
          <EmptyState
            title="Nenhuma partida gerada"
            description="Gere a fase de grupos no painel de jogadores depois de cadastrar o elenco completo."
            action={
              <Link href={`/admin/torneios/${id}/jogadores`} className="arena-button-primary">
                Ir para jogadores
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
                      <LeagueMatchFormCard
                        key={match.id}
                        match={match}
                        index={index}
                        roundNumber={roundNumber}
                        tournamentId={tournament.id}
                        homePlayer={playersById[match.homePlayerId]}
                        awayPlayer={playersById[match.awayPlayerId]}
                        locked={locked}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {canGenerateKnockout ? (
          <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="arena-label">Próxima etapa</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Todas as partidas foram finalizadas</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Gere o mata-mata automaticamente com base no top 4 da tabela.</p>
            </div>

            <form action={generateKnockoutStageAction}>
              <input type="hidden" name="tournamentId" value={tournament.id} />
              <button type="submit" className="arena-button-primary">
                Gerar mata-mata
              </button>
            </form>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/torneios/${id}/tabela`} className="arena-button-secondary">
            Ver tabela
          </Link>
          <Link href={`/admin/torneios/${id}/mata-mata`} className="arena-button-primary">
            Ver mata-mata
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}

function LeagueMatchFormCard({
  match,
  index,
  roundNumber,
  tournamentId,
  homePlayer,
  awayPlayer,
  locked,
}: {
  match: Match;
  index: number;
  roundNumber: number;
  tournamentId: string;
  homePlayer?: Player | null;
  awayPlayer?: Player | null;
  locked: boolean;
}) {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Confronto {index + 1}</div>
          <h3 className="text-lg font-semibold text-slate-900">
            {homePlayer?.name ?? "Mandante"} <span className="text-slate-300">x</span> {awayPlayer?.name ?? "Visitante"}
          </h3>
          <p className="text-sm text-slate-500">Rodada {roundNumber}</p>
        </div>

        <span className={match.status === "FINISHED" ? "arena-badge border-emerald-200 bg-emerald-50 text-emerald-700" : "arena-badge bg-slate-100 text-slate-700"}>
          {MATCH_STATUS_LABELS[match.status]}
        </span>
      </div>

      <form action={saveLeagueMatchResultAction} className="space-y-4">
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <input type="hidden" name="matchId" value={match.id} />

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <label className="space-y-2">
            <span className="arena-label">{homePlayer?.name ?? "Mandante"}</span>
            <input
              type="number"
              min={0}
              step={1}
              name="homeScore"
              defaultValue={match.homeScore ?? ""}
              disabled={locked}
              className="arena-input"
              placeholder="0"
            />
          </label>

          <div className="flex items-center justify-center pb-1 text-2xl font-semibold text-slate-300">x</div>

          <label className="space-y-2">
            <span className="arena-label">{awayPlayer?.name ?? "Visitante"}</span>
            <input
              type="number"
              min={0}
              step={1}
              name="awayScore"
              defaultValue={match.awayScore ?? ""}
              disabled={locked}
              className="arena-input"
              placeholder="0"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={locked} className="arena-button-primary disabled:cursor-not-allowed disabled:opacity-50">
            Salvar resultado
          </button>

          <button
            type="submit"
            formAction={clearLeagueMatchResultAction}
            disabled={locked}
            className="arena-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpar resultado
          </button>
        </div>
      </form>
    </Card>
  );
}
