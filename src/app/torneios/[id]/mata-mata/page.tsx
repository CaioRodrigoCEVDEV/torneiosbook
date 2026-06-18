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

export default async function TournamentKnockoutPage({ params }: { params: PageParams }) {
  const { id } = await Promise.resolve(params);
  const context = await getTournamentContext(id, true);

  if (!context) {
    notFound();
  }

  const { tournament, semifinals, finalMatch, champion, leagueFinished, playersById } = context;

  return (
    <PublicShell>
      <div className="space-y-8 py-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_FORMAT_LABELS[tournament.format]}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Mata-mata</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">Semifinais, final e campeão do torneio.</p>
          </div>

          <TournamentSubnav basePath={`/torneios/${id}`} active="knockout" />
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
              <Link href={`/torneios/${id}/partidas`} className="arena-button-primary">
                Ver partidas
              </Link>
            }
          />
        ) : semifinals.length === 0 && !finalMatch ? (
          <EmptyState
            title="Mata-mata ainda não gerado"
            description="Quando o painel admin gerar o bracket, as semifinais aparecem aqui."
            action={
              <Link href={`/torneios/${id}/partidas`} className="arena-button-primary">
                Acompanhar partidas
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {semifinals.length > 0 ? (
              <section className="space-y-4">
                <div>
                  <p className="arena-label">Semifinais</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Classificados para a decisão</h2>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {semifinals.map((match, index) => (
                    <MatchSummaryCard
                      key={match.id}
                      match={match}
                      title={`Semifinal ${index + 1}`}
                      subtitle={index === 0 ? "1º x 4º" : "2º x 3º"}
                      homePlayer={playersById[match.homePlayerId]}
                      awayPlayer={playersById[match.awayPlayerId]}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-4">
              <div>
                <p className="arena-label">Final</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Confronto decisivo</h2>
              </div>

              {finalMatch ? (
                <MatchSummaryCard
                  match={finalMatch}
                  title="Final"
                  subtitle="Valendo o título da Arena FC"
                  homePlayer={playersById[finalMatch.homePlayerId]}
                  awayPlayer={playersById[finalMatch.awayPlayerId]}
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
