import type { Player, Standing } from "@/lib/tournament-types";
import { cn } from "@/lib/utils";

const standingsColumns = [
  { label: "POSIÇÃO", width: "w-[120px]", align: "text-center" },
  { label: "JOGADOR", width: "w-[240px]", align: "text-left" },
  { label: "TIME", width: "w-[135px]", align: "text-left" },
  { label: "JOGOS", width: "w-[85px]", align: "text-center" },
  { label: "VITÓRIAS", width: "w-[90px]", align: "text-center" },
  { label: "EMPATES", width: "w-[90px]", align: "text-center" },
  { label: "DERROTAS", width: "w-[95px]", align: "text-center" },
  { label: "GP", width: "w-[65px]", align: "text-center" },
  { label: "GC", width: "w-[65px]", align: "text-center" },
  { label: "SG", width: "w-[65px]", align: "text-center" },
  { label: "PTS", width: "w-[70px]", align: "text-center" },
] as const;

interface StandingsTableProps {
  standings: Standing[];
  playersById: Record<string, Player>;
  className?: string;
}

export function StandingsTable({ standings, playersById, className }: StandingsTableProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm", className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-[13px] leading-5">
          <colgroup>
            {standingsColumns.map((column) => (
              <col key={column.label} className={column.width} />
            ))}
          </colgroup>

          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {standingsColumns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={cn("whitespace-nowrap py-3 font-semibold", column.align, column.width)}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {standings.map((standing, index) => {
              const player = playersById[standing.playerId];
              const classified = index < 4;

              return (
                <tr
                  key={standing.playerId}
                  className="border-b border-slate-100 bg-white transition hover:bg-slate-50 last:border-b-0"
                >
                  <td
                    className={cn(
                      "relative px-4 py-4 align-middle",
                      classified ? "before:absolute before:inset-y-0 before:left-0 before:block before:w-1 before:rounded-r-md before:bg-emerald-500 before:content-['']" : "",
                    )}
                  >
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-950">
                        {index + 1}
                      </span>
                      {classified ? <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">Classificado</span> : null}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-middle">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-semibold text-slate-950">{player?.name ?? "Jogador removido"}</p>
                      {player?.nickname ? <p className="truncate text-xs text-slate-500">@{player.nickname}</p> : null}
                    </div>
                  </td>

                  <td className="px-3 py-4 align-middle">
                    <p className="truncate text-slate-700">{player?.team ?? "—"}</p>
                  </td>
                  <td className="px-3 py-4 text-center text-slate-600">{standing.played}</td>
                  <td className="px-3 py-4 text-center text-slate-600">{standing.wins}</td>
                  <td className="px-3 py-4 text-center text-slate-600">{standing.draws}</td>
                  <td className="px-3 py-4 text-center text-slate-600">{standing.losses}</td>
                  <td className="px-3 py-4 text-center text-slate-600">{standing.goalsFor}</td>
                  <td className="px-3 py-4 text-center text-slate-600">{standing.goalsAgainst}</td>
                  <td className="px-3 py-4 text-center text-slate-600">{standing.goalDifference}</td>
                  <td className="px-3 py-4 text-center font-bold text-slate-950">{standing.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
