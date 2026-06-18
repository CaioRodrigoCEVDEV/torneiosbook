import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { TournamentSubnav } from "@/components/layout/TournamentSubnav";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { clearKnockoutMatchResultAction, generateKnockoutStageAction, logoutAdminAction, saveKnockoutMatchResultAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";
import { getTournamentContext } from "@/lib/tournament-service";
import { MATCH_STATUS_LABELS, TOURNAMENT_FORMAT_LABELS, TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";
import type { Match, Player } from "@/lib/tournament-types";

type PageParams = { id: string } | Promise<{ id: string }>;

export default async function AdminTournamentKnockoutPage({ params }: { params: PageParams }) {
  await requireAdmin();
  const { id } = await Promise.resolve(params);
  const context = await getTournamentContext(id, false);

  if (!context) {
    notFound();
  }

  const { tournament, semifinals, finalMatch, champion, leagueFinished, playersById } = context;
  const locked = tournament.status === "FINISHED";

  return (
    <AdminShell onLogout={logoutAdminAction}>
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_FORMAT_LABELS[tournament.format]}</span>
            <span className={locked ? "arena-badge border-amber-200 bg-amber-50 text-amber-700" : "arena-badge bg-slate-100 text-slate-700"}>
              {locked ? "Torneio finalizado" : "Mata-mata aberto"}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Mata-mata</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">Finalize as semifinais e acompanhe a final até definir o campeão.</p>
          </div>

          <TournamentSubnav basePath={`/admin/torneios/${id}`} active="knockout" includePlayers />
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Semifinais" value={semifinals.length} description="1º x 4º e 2º x 3º." tone="slate" />
          <StatCard label="Final" value={finalMatch ? (finalMatch.status === "FINISHED" ? "Finalizada" : "Em aberto") : "Aguardando"} description="Criada automaticamente após as semis." tone="emerald" />
          <StatCard label="Campeão" value={champion ? champion.name : "—"} description={champion ? champion.team : "Definido após a final"} tone="amber" />
        </div>

        {!leagueFinished ? (
          <EmptyState
            title="Mata-mata bloqueado"
            description="Finalize todas as partidas da fase de grupos para liberar o bracket."
            action={
              <Link href={`/admin/torneios/${id}/partidas`} className="arena-button-primary">
                Ver partidas
              </Link>
            }
          />
        ) : semifinals.length === 0 && !finalMatch ? (
          <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="arena-label">Bracket</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Mata-mata ainda não gerado</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Gere o bracket automaticamente com base no top 4 da tabela.</p>
            </div>

            <form action={generateKnockoutStageAction}>
              <input type="hidden" name="tournamentId" value={tournament.id} />
              <button type="submit" className="arena-button-primary">
                Gerar mata-mata
              </button>
            </form>
          </Card>
        ) : (
          <div className="space-y-6">
            {semifinals.length > 0 ? (
              <section className="space-y-4">
                <div>
                  <p className="arena-label">Semifinais</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Defina os finalistas</h2>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {semifinals.map((match, index) => (
                    <KnockoutMatchFormCard
                      key={match.id}
                      match={match}
                      title={`Semifinal ${index + 1}`}
                      subtitle={index === 0 ? "1º x 4º" : "2º x 3º"}
                      tournamentId={tournament.id}
                      homePlayer={playersById[match.homePlayerId]}
                      awayPlayer={playersById[match.awayPlayerId]}
                      locked={locked}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-4">
              <div>
                <p className="arena-label">Final</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Decisão do título</h2>
              </div>

              {finalMatch ? (
                <KnockoutMatchFormCard
                  match={finalMatch}
                  title="Final"
                  subtitle="Valendo o título da Arena FC"
                  tournamentId={tournament.id}
                  homePlayer={playersById[finalMatch.homePlayerId]}
                  awayPlayer={playersById[finalMatch.awayPlayerId]}
                  locked={locked}
                  className="border-amber-200"
                />
              ) : (
                <EmptyState title="Final ainda não gerada" description="Depois das semifinais, a final aparece automaticamente aqui." />
              )}
            </section>

            {champion ? (
              <section className="rounded-md border border-emerald-200 bg-emerald-50 p-6">
                <p className="arena-label text-emerald-700">Campeão</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">{champion.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{champion.team}</p>
              </section>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/torneios/${id}/tabela`} className="arena-button-secondary">
            Ver tabela
          </Link>
          <Link href={`/admin/torneios/${id}/partidas`} className="arena-button-primary">
            Ver partidas
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}

function KnockoutMatchFormCard({
  match,
  title,
  subtitle,
  tournamentId,
  homePlayer,
  awayPlayer,
  locked,
  className,
}: {
  match: Match;
  title: string;
  subtitle?: string;
  tournamentId: string;
  homePlayer?: Player | null;
  awayPlayer?: Player | null;
  locked: boolean;
  className?: string;
}) {
  return (
    <Card className={className ? `space-y-4 p-5 ${className}` : "space-y-4 p-5"}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div>
          <h3 className="text-lg font-semibold text-slate-900">
            {homePlayer?.name ?? "Mandante"} <span className="text-slate-300">x</span> {awayPlayer?.name ?? "Visitante"}
          </h3>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        <span className={match.status === "FINISHED" ? "arena-badge border-emerald-200 bg-emerald-50 text-emerald-700" : "arena-badge bg-slate-100 text-slate-700"}>
          {MATCH_STATUS_LABELS[match.status]}
        </span>
      </div>

      <form action={saveKnockoutMatchResultAction} className="space-y-4">
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

        <label className="block space-y-2">
          <span className="arena-label">Vencedor nos pênaltis</span>
          <select name="winnerPlayerId" defaultValue={match.winnerPlayerId ?? ""} disabled={locked} className="arena-input">
            <option value="">Selecione apenas se houver empate</option>
            <option value={homePlayer?.id}>{homePlayer?.name ?? "Mandante"}</option>
            <option value={awayPlayer?.id}>{awayPlayer?.name ?? "Visitante"}</option>
          </select>
        </label>

        <p className="text-sm leading-6 text-slate-500">Se o placar terminar empatado, escolha o vencedor nos pênaltis antes de salvar.</p>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={locked} className="arena-button-primary disabled:cursor-not-allowed disabled:opacity-50">
            Salvar resultado
          </button>

          <button
            type="submit"
            formAction={clearKnockoutMatchResultAction}
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
