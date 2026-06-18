import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { TournamentListItem } from "@/lib/tournament-types";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-labels";
import { cn } from "@/lib/utils";

interface PublicTournamentCardProps {
  tournament: TournamentListItem;
  href: string;
  className?: string;
}

const STATS = [
  { key: "playersCount", label: "Jogadores" },
  { key: "matchesCount", label: "Partidas" },
  { key: "finishedMatchesCount", label: "Finalizadas" },
] as const;

export function PublicTournamentCard({ tournament, href, className }: PublicTournamentCardProps) {
  return (
    <Link href={href} className={cn("group flex h-full w-full justify-center", className)}>
      <Card className="h-full w-full max-w-[36rem] p-7 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <Badge className="bg-slate-100 text-slate-700">{TOURNAMENT_STATUS_LABELS[tournament.status]}</Badge>
            <h2 className="break-words text-lg font-semibold text-slate-900 transition group-hover:text-emerald-700">
              {tournament.name}
            </h2>
            <p className="break-words text-sm leading-6 text-slate-600">{tournament.game}</p>
          </div>

          <span className="shrink-0 text-xl font-semibold text-slate-300 transition group-hover:text-emerald-600">→</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.key} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-500">{stat.label}</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">
                {tournament[stat.key]}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  );
}
