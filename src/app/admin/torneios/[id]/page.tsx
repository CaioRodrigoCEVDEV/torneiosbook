import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { TournamentSubnav } from "@/components/layout/TournamentSubnav";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatCard } from "@/components/ui/StatCard";
import { deleteTournamentAction, logoutAdminAction, updateTournamentAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";
import { getTournamentContext } from "@/lib/tournament-service";
import { TOURNAMENT_FORMAT_LABELS, TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";

type PageParams = { id: string } | Promise<{ id: string }>;
type SearchParamsInput = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

export default async function AdminTournamentOverviewPage({ params, searchParams }: { params: PageParams; searchParams?: SearchParamsInput }) {
  await requireAdmin();
  const { id } = await Promise.resolve(params);
  const query = await Promise.resolve(searchParams ?? {});
  const message = typeof query.error === "string" ? query.error : "";
  const context = await getTournamentContext(id, false);

  if (!context) {
    notFound();
  }

  const { tournament, totalMatches, finishedMatches, pendingMatches, champion, playersById, summary } = context;

  return (
    <AdminShell onLogout={logoutAdminAction}>
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_FORMAT_LABELS[tournament.format]}</span>
            <span className={tournament.isPublic ? "arena-badge border-emerald-200 bg-emerald-50 text-emerald-700" : "arena-badge bg-slate-100 text-slate-700"}>
              {tournament.isPublic ? "Publicado" : "Privado"}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{tournament.name}</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">{tournament.game}</p>
          </div>

          <TournamentSubnav basePath={`/admin/torneios/${id}`} active="overview" includePlayers />
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Jogadores" value={tournament.players.length} description="Elenco configurado." tone="slate" />
          <StatCard label="Partidas" value={totalMatches} description={`${finishedMatches} finalizadas e ${pendingMatches} pendentes.`} tone="emerald" />
          <StatCard label="Líder" value={summary.leader ? playersById[summary.leader.playerId]?.name ?? "—" : "—"} description={summary.leader ? `${summary.leader.points} pontos` : "Sem jogos concluídos"} tone="blue" />
          <StatCard label="Campeão" value={champion ? champion.name : "—"} description={champion ? champion.team : "Definido após a final"} tone="amber" />
        </div>

        {message ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{message}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="space-y-4 p-6">
            <div>
              <p className="arena-label">Editar torneio</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Informações básicas</h2>
            </div>

            <form action={updateTournamentAction} className="space-y-4">
              <input type="hidden" name="tournamentId" value={tournament.id} />

              <label className="block space-y-2">
                <span className="arena-label">Nome</span>
                <input name="name" defaultValue={tournament.name} className="arena-input" />
              </label>

              <label className="block space-y-2">
                <span className="arena-label">Jogo</span>
                <input name="game" defaultValue={tournament.game} className="arena-input" />
              </label>

              <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input name="isPublic" type="checkbox" defaultChecked={tournament.isPublic} className="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600" />
                Publicar torneio na vitrine pública
              </label>

              <button type="submit" className="arena-button-primary">
                Salvar alterações
              </button>
            </form>
          </Card>

          <Card className="space-y-4 p-6">
            <div>
              <p className="arena-label">Ações rápidas</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Gerenciar fluxo</h2>
            </div>

            <div className="space-y-3">
              <Link href={`/admin/torneios/${id}/jogadores`} className="arena-button-secondary w-full">
                Jogadores
              </Link>
              <Link href={`/admin/torneios/${id}/partidas`} className="arena-button-secondary w-full">
                Partidas
              </Link>
              <Link href={`/admin/torneios/${id}/tabela`} className="arena-button-secondary w-full">
                Tabela
              </Link>
              <Link href={`/admin/torneios/${id}/mata-mata`} className="arena-button-secondary w-full">
                Mata-mata
              </Link>
            </div>

            <form action={deleteTournamentAction}>
              <input type="hidden" name="tournamentId" value={tournament.id} />
              <ConfirmDialog message="Excluir este torneio? Todos os jogadores e partidas serão removidos." className="w-full">
                Excluir torneio
              </ConfirmDialog>
            </form>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
