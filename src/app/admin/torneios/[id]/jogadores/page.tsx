import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { TournamentSubnav } from "@/components/layout/TournamentSubnav";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatCard } from "@/components/ui/StatCard";
import { addPlayerAction, deletePlayerAction, generateLeagueStageAction, logoutAdminAction, updatePlayerAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";
import { getTournamentContext } from "@/lib/tournament-service";
import { PLAYER_PLATFORM_LABELS, TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";

type PageParams = { id: string } | Promise<{ id: string }>;
type SearchParamsInput = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

const PLATFORM_OPTIONS = [
  { value: "PS5", label: PLAYER_PLATFORM_LABELS.PS5 },
  { value: "XBOX", label: PLAYER_PLATFORM_LABELS.XBOX },
  { value: "PC", label: PLAYER_PLATFORM_LABELS.PC },
] as const;

export default async function AdminTournamentPlayersPage({ params, searchParams }: { params: PageParams; searchParams?: SearchParamsInput }) {
  await requireAdmin();
  const { id } = await Promise.resolve(params);
  const query = await Promise.resolve(searchParams ?? {});
  const context = await getTournamentContext(id, false);

  if (!context) {
    notFound();
  }

  const { tournament } = context;
  const editingPlayerId = typeof query.edit === "string" ? query.edit : "";
  const editingPlayer = tournament.players.find((player) => player.id === editingPlayerId) ?? null;
  const rosterLocked = tournament.matches.length > 0;
  const canGenerateLeague = tournament.players.length === 6 && tournament.matches.length === 0;
  const message = typeof query.error === "string" ? query.error : "";

  return (
    <AdminShell onLogout={logoutAdminAction}>
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="arena-badge bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</span>
            <span className={rosterLocked ? "arena-badge border-amber-200 bg-amber-50 text-amber-700" : "arena-badge bg-slate-100 text-slate-700"}>
              {rosterLocked ? "Elenco travado" : "Elenco aberto"}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Jogadores</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">Cadastre os 6 jogadores do torneio antes de gerar a fase de grupos.</p>
          </div>

          <TournamentSubnav basePath={`/admin/torneios/${id}`} active="players" includePlayers />
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Jogadores" value={tournament.players.length} description="Limite fixo de 6 competidores." tone="slate" />
          <StatCard label="Faltam" value={Math.max(6 - tournament.players.length, 0)} description="Complete o elenco para gerar os jogos." tone="amber" />
          <StatCard label="Status" value={TOURNAMENT_STATUS_LABELS[tournament.status]} description={rosterLocked ? "Cadastro travado após a geração." : "Cadastro aberto."} tone="emerald" />
        </div>

        {message ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{message}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-5 p-6">
            <div>
              <p className="arena-label">Cadastro</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{editingPlayer ? "Editar jogador" : "Novo jogador"}</h2>
            </div>

            {rosterLocked ? (
              <div className="space-y-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                <p className="font-semibold">Cadastro travado</p>
                <p>Depois que as partidas são geradas, o elenco não pode mais ser alterado.</p>
                <Link href={`/admin/torneios/${id}/partidas`} className="arena-button-primary inline-flex">
                  Ir para partidas
                </Link>
              </div>
            ) : (
              <form action={editingPlayer ? updatePlayerAction : addPlayerAction} className="space-y-4">
                <input type="hidden" name="tournamentId" value={tournament.id} />
                {editingPlayer ? <input type="hidden" name="playerId" value={editingPlayer.id} /> : null}

                <label className="block space-y-2">
                  <span className="arena-label">Nome</span>
                  <input name="name" defaultValue={editingPlayer?.name ?? ""} className="arena-input" placeholder="Seu nome" />
                </label>

                <label className="block space-y-2">
                  <span className="arena-label">Apelido opcional</span>
                  <input name="nickname" defaultValue={editingPlayer?.nickname ?? ""} className="arena-input" placeholder="Ex.: Nino, Rafa, K9" />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="arena-label">Time</span>
                    <input name="team" defaultValue={editingPlayer?.team ?? ""} className="arena-input" placeholder="Real Madrid, PSG, etc." />
                  </label>

                  <label className="block space-y-2">
                    <span className="arena-label">Plataforma opcional</span>
                    <select name="platform" defaultValue={editingPlayer?.platform ?? ""} className="arena-input">
                      <option value="">Sem plataforma</option>
                      {PLATFORM_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="arena-button-primary">
                    {editingPlayer ? "Salvar alterações" : "Adicionar jogador"}
                  </button>

                  {editingPlayer ? (
                    <Link href={`/admin/torneios/${id}/jogadores`} className="arena-button-secondary">
                      Cancelar
                    </Link>
                  ) : null}
                </div>
              </form>
            )}

            {canGenerateLeague ? (
              <form action={generateLeagueStageAction}>
                <input type="hidden" name="tournamentId" value={tournament.id} />
                <button type="submit" className="arena-button-primary w-full">
                  Gerar fase de grupos
                </button>
              </form>
            ) : null}
          </Card>

          <Card className="space-y-4 p-6">
            <div>
              <p className="arena-label">Elenco</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Jogadores cadastrados</h2>
            </div>

            {tournament.players.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Adicione o primeiro participante para começar o torneio.
              </div>
            ) : (
              <div className="space-y-3">
                {tournament.players.map((player, index) => (
                  <div key={player.id} className="flex items-start justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-900">
                        {index + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-900">{player.name}</div>
                        {player.nickname ? <div className="text-xs text-slate-500">@{player.nickname}</div> : null}
                        <div className="text-sm text-slate-600">{player.team}</div>
                        {player.platform ? <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{PLAYER_PLATFORM_LABELS[player.platform]}</div> : null}
                      </div>
                    </div>

                    {!rosterLocked ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/admin/torneios/${id}/jogadores?edit=${player.id}`} className="arena-button-secondary">
                          Editar
                        </Link>

                        <form action={deletePlayerAction}>
                          <input type="hidden" name="tournamentId" value={tournament.id} />
                          <input type="hidden" name="playerId" value={player.id} />
                          <ConfirmDialog message={`Remover ${player.name}?`} className="w-full sm:w-auto">
                            Remover
                          </ConfirmDialog>
                        </form>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
