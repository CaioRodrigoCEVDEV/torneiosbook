"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MATCH_STATUS_LABELS } from "@/lib/constants";
import type { Match, Player } from "@/lib/types";
import { cn, toScore } from "@/lib/utils";

type MatchResultPayload = {
  homeScore: number;
  awayScore: number;
  winnerPlayerId?: string | null;
  decidedByPenalties?: boolean;
};

interface MatchCardProps {
  match: Match;
  title: string;
  subtitle?: string;
  homePlayer?: Player;
  awayPlayer?: Player;
  onSave: (payload: MatchResultPayload) => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
}

export function MatchCard({ match, title, subtitle, homePlayer, awayPlayer, onSave, onClear, disabled = false, className }: MatchCardProps) {
  const [homeScore, setHomeScore] = useState(match.homeScore === null ? "" : String(match.homeScore));
  const [awayScore, setAwayScore] = useState(match.awayScore === null ? "" : String(match.awayScore));
  const [winnerPlayerId, setWinnerPlayerId] = useState(match.winnerPlayerId ?? "");
  const [error, setError] = useState("");

  const parsedHomeScore = toScore(homeScore);
  const parsedAwayScore = toScore(awayScore);
  const scoresValid = parsedHomeScore !== null && parsedAwayScore !== null;
  const tie = scoresValid && parsedHomeScore === parsedAwayScore;
  const needsPenaltyWinner = match.phase !== "league" && tie;
  const canSave = !disabled && scoresValid && (!needsPenaltyWinner || Boolean(winnerPlayerId));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (parsedHomeScore === null || parsedAwayScore === null) {
      setError("Informe placares inteiros e não negativos.");
      return;
    }

    if (needsPenaltyWinner && !winnerPlayerId) {
      setError("Selecione o vencedor nos pênaltis.");
      return;
    }

    setError("");

    onSave({
      homeScore: parsedHomeScore,
      awayScore: parsedAwayScore,
      winnerPlayerId: needsPenaltyWinner ? winnerPlayerId : null,
      decidedByPenalties: needsPenaltyWinner,
    });
  };

  return (
    <article className={cn("arena-card flex flex-col gap-5 p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="arena-badge">{title}</span>
          <div>
            <h3 className="mt-3 text-xl font-bold text-white">
              {homePlayer?.name ?? "Mandante"} <span className="text-zinc-500">x</span> {awayPlayer?.name ?? "Visitante"}
            </h3>
            {subtitle ? <p className="mt-1 text-sm text-zinc-400">{subtitle}</p> : null}
          </div>
        </div>

        <span
          className={cn(
            "arena-badge",
            match.status === "finished" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "text-zinc-300",
          )}
        >
          {MATCH_STATUS_LABELS[match.status]}
        </span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <label className="space-y-2">
            <span className="arena-label">{homePlayer?.name ?? "Mandante"}</span>
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={homeScore}
              onChange={(event) => setHomeScore(event.target.value)}
              disabled={disabled}
              className="arena-input"
              placeholder="0"
            />
          </label>

          <div className="flex items-center justify-center pb-1 text-2xl font-black text-zinc-500">x</div>

          <label className="space-y-2">
            <span className="arena-label">{awayPlayer?.name ?? "Visitante"}</span>
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={awayScore}
              onChange={(event) => setAwayScore(event.target.value)}
              disabled={disabled}
              className="arena-input"
              placeholder="0"
            />
          </label>
        </div>

        {match.phase !== "league" && (tie || Boolean(match.winnerPlayerId)) ? (
          <label className="space-y-2">
            <span className="arena-label">Vencedor nos pênaltis</span>
            <select
              value={winnerPlayerId}
              onChange={(event) => setWinnerPlayerId(event.target.value)}
              disabled={disabled}
              className="arena-input"
            >
              <option value="">Selecione o vencedor</option>
              <option value={homePlayer?.id}>{homePlayer?.name ?? "Mandante"}</option>
              <option value={awayPlayer?.id}>{awayPlayer?.name ?? "Visitante"}</option>
            </select>
          </label>
        ) : null}

        {match.phase !== "league" && tie ? (
          <p className="text-sm text-zinc-400">Empate detectado. Escolha manualmente o vencedor para continuar.</p>
        ) : null}

        {error ? <p className="text-sm font-medium text-rose-300">{error}</p> : null}

        {match.status === "finished" && getWinnerLabel(match, homePlayer, awayPlayer) ? (
          <p className="text-sm text-emerald-200">Vencedor: {getWinnerLabel(match, homePlayer, awayPlayer)}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={!canSave} className="arena-button-primary disabled:cursor-not-allowed disabled:opacity-50">
            Salvar resultado
          </button>
          <button type="button" onClick={onClear} disabled={disabled} className="arena-button-secondary disabled:cursor-not-allowed disabled:opacity-50">
            Limpar resultado
          </button>
        </div>
      </form>
    </article>
  );
}

function getWinnerLabel(match: Match, homePlayer?: Player, awayPlayer?: Player) {
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
