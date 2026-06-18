"use client";

import type { KnockoutMatch, Player } from "@/lib/types";
import { MatchCard } from "./MatchCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface KnockoutBracketProps {
  semifinals: KnockoutMatch[];
  finalMatch?: KnockoutMatch | null;
  champion?: Player | null;
  playersById: Record<string, Player>;
  onSaveMatch: (match: KnockoutMatch, payload: { homeScore: number; awayScore: number; winnerPlayerId?: string | null }) => void;
  onClearMatch: (match: KnockoutMatch) => void;
  disabled?: boolean;
}

export function KnockoutBracket({ semifinals, finalMatch, champion, playersById, onSaveMatch, onClearMatch, disabled = false }: KnockoutBracketProps) {
  const orderedSemifinals = [...semifinals].sort((left, right) => left.bracket.localeCompare(right.bracket));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {orderedSemifinals.map((match, index) => (
          <MatchCard
            key={`${match.id}-${match.homeScore ?? "n"}-${match.awayScore ?? "n"}-${match.winnerPlayerId ?? "n"}-${match.status}`}
            match={match}
            title={`Semifinal ${index + 1}`}
            subtitle={index === 0 ? "1º x 4º" : "2º x 3º"}
            homePlayer={playersById[match.homePlayerId]}
            awayPlayer={playersById[match.awayPlayerId]}
            onSave={(payload) => onSaveMatch(match, payload)}
            onClear={() => onClearMatch(match)}
            disabled={disabled}
          />
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="arena-badge border-amber-400/20 bg-amber-400/10 text-amber-200">Final</span>
            <p className="mt-2 text-sm text-zinc-400">A final é criada automaticamente quando as semifinais terminam.</p>
          </div>
        </div>

        {finalMatch ? (
          <MatchCard
            key={`${finalMatch.id}-${finalMatch.homeScore ?? "n"}-${finalMatch.awayScore ?? "n"}-${finalMatch.winnerPlayerId ?? "n"}-${finalMatch.status}`}
            match={finalMatch}
            title="Final"
            subtitle="Valendo o título de Torneios"
            homePlayer={playersById[finalMatch.homePlayerId]}
            awayPlayer={playersById[finalMatch.awayPlayerId]}
            onSave={(payload) => onSaveMatch(finalMatch, payload)}
            onClear={() => onClearMatch(finalMatch)}
            disabled={disabled}
            className="border-amber-400/20 bg-amber-400/5"
          />
        ) : (
          <EmptyState
            title="Final ainda não gerada"
            description="Depois que as duas semifinais tiverem vencedores, a final será criada automaticamente aqui."
          />
        )}
      </section>

      {champion ? (
        <section className="arena-card border-emerald-400/20 bg-emerald-400/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="arena-badge border-emerald-400/20 bg-emerald-400/10 text-emerald-200">Campeão</span>
              <h3 className="mt-3 text-2xl font-black text-white">{champion.name}</h3>
              <p className="mt-1 text-sm text-zinc-300">{champion.team}</p>
            </div>

            <div
              className="grid size-16 place-items-center rounded-3xl text-xl font-black text-slate-950 shadow-lg shadow-emerald-500/20"
              style={{ backgroundColor: champion.color || "#10b981" }}
            >
              {champion.name.trim().slice(0, 1).toUpperCase()}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
