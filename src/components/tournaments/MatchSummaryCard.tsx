import { Card } from "@/components/ui/Card";
import type { Match, Player } from "@/lib/tournament-types";
import { MATCH_PHASE_LABELS, MATCH_STATUS_LABELS } from "@/lib/tournament-labels";
import { cn } from "@/lib/utils";

interface MatchSummaryCardProps {
  match: Match;
  homePlayer?: Player | null;
  awayPlayer?: Player | null;
  title: string;
  subtitle?: string;
  className?: string;
}

export function MatchSummaryCard({ match, homePlayer, awayPlayer, title, subtitle, className }: MatchSummaryCardProps) {
  const winnerLabel = getWinnerLabel(match, homePlayer, awayPlayer);

  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div>
          <h3 className="text-lg font-semibold text-slate-900">
            {homePlayer?.name ?? "Mandante"} <span className="text-slate-300">x</span> {awayPlayer?.name ?? "Visitante"}
          </h3>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="arena-badge bg-slate-100 text-slate-700">{MATCH_PHASE_LABELS[match.phase]}</span>
          <span className={cn("arena-badge", match.status === "FINISHED" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>
            {MATCH_STATUS_LABELS[match.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{homePlayer?.team ?? "Time mandante"}</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{homePlayer?.name ?? "Mandante"}</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-semibold text-slate-900">
            {formatScore(match.homeScore)} <span className="text-slate-300">x</span> {formatScore(match.awayScore)}
          </div>
          {match.decidedByPenalties ? <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Pênaltis</div> : null}
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{awayPlayer?.team ?? "Time visitante"}</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{awayPlayer?.name ?? "Visitante"}</div>
        </div>
      </div>

      {winnerLabel ? <p className="text-sm leading-6 text-emerald-700">Vencedor: {winnerLabel}</p> : null}
    </Card>
  );
}

function formatScore(score: number | null) {
  return score === null ? "-" : String(score);
}

function getWinnerLabel(match: Match, homePlayer?: Player | null, awayPlayer?: Player | null) {
  if (match.homeScore === null || match.awayScore === null) {
    return null;
  }

  if (match.homeScore > match.awayScore) {
    return homePlayer?.name ?? "Mandante";
  }

  if (match.homeScore < match.awayScore) {
    return awayPlayer?.name ?? "Visitante";
  }

  if (!match.winnerPlayerId) {
    return null;
  }

  if (match.winnerPlayerId === homePlayer?.id) {
    return `${homePlayer?.name ?? "Mandante"} nos pênaltis`;
  }

  if (match.winnerPlayerId === awayPlayer?.id) {
    return `${awayPlayer?.name ?? "Visitante"} nos pênaltis`;
  }

  return null;
}
