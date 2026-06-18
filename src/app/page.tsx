import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { PublicTournamentCard } from "@/components/tournaments/PublicTournamentCard";
import { getPublicTournaments } from "@/lib/tournament-service";

export default async function Home() {
  const tournaments = await getPublicTournaments();
  const activeTournaments = tournaments.filter((tournament) => tournament.status === "LEAGUE" || tournament.status === "KNOCKOUT");
  const finishedTournaments = tournaments.filter((tournament) => tournament.status === "FINISHED");
  const featuredTournaments = tournaments.slice(0, 3);

  return (
    <PublicShell>
      <div className="space-y-10 py-5 sm:py-6">
        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-5">
            <Badge>Plataforma pública</Badge>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Torneios
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Campeonatos de EA FC com tabela automática, mata-mata simples e visual claro para acompanhar cada rodada.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/torneios" className="arena-button-primary">
                Ver torneios
              </Link>
              <Link href="/admin/login" className="arena-button-secondary">
                Acesso admin
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Torneios públicos" value={tournaments.length} description="Listados nesta vitrine." tone="slate" />
              <StatCard label="Em andamento" value={activeTournaments.length} description="Fase de grupos ou mata-mata." tone="emerald" />
              <StatCard label="Finalizados" value={finishedTournaments.length} description="Campeões definidos." tone="amber" />
            </div>
          </div>

          <Card className="space-y-6 p-7">
            <div className="space-y-2">
              <Badge className="bg-slate-100 text-slate-700">Formato oficial</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">6 jogadores, 15 partidas, top 4 no mata-mata</h2>
            </div>

            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>• Cadastro simples de jogadores e times</p>
              <p>• Resultados com tabela automática</p>
              <p>• Semifinais, final e campeão</p>
              <p>• Acesso público para acompanhar tudo</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["15", "partidas"],
                ["4", "classificados"],
                ["1", "campeão"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-2xl font-semibold text-slate-900">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <PageHeader
            eyebrow="Destaques"
            title="Torneios públicos"
            description="Abra um campeonato publicado e acompanhe a tabela, as partidas e o mata-mata."
          />

          {featuredTournaments.length === 0 ? (
            <EmptyState
              title="Nenhum torneio publicado"
              description="Quando houver um campeonato liberado, ele aparece aqui para consulta pública."
              action={
                <Link href="/admin/login" className="arena-button-primary">
                  Publicar torneio
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredTournaments.map((tournament) => (
                <PublicTournamentCard key={tournament.id} tournament={tournament} href={`/torneios/${tournament.id}`} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <PageHeader
            eyebrow="Passo a passo"
            title="Como funciona"
            description="Um fluxo simples para criar, jogar e acompanhar o torneio sem ruído visual."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["01", "Criar torneio", "Defina nome, jogo e publique quando quiser."],
              ["02", "Cadastrar jogadores", "Adicione os 6 competidores com nome e time."],
              ["03", "Registrar placares", "Atualize os resultados e a tabela se organiza."],
              ["04", "Acompanhar campeão", "Veja o top 4, o mata-mata e o título final."],
            ].map(([step, title, text]) => (
              <Card key={title} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-md border border-slate-200 bg-slate-900 text-sm font-semibold text-white">
                    {step}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                </div>
                <p className="text-sm leading-6 text-slate-600">{text}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
