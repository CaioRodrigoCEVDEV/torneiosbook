"use client";

import type { Player } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DEFAULT_AVATAR_COLOR } from "@/lib/constants";

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onRemove?: (playerId: string) => void;
  removeDisabled?: boolean;
  className?: string;
}

export function PlayerCard({ player, onEdit, onRemove, removeDisabled = false, className }: PlayerCardProps) {
  const initials = player.name.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <article className={cn("arena-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-4">
        <div
          className="grid size-14 place-items-center rounded-2xl text-lg font-black text-slate-950 shadow-lg shadow-black/30"
          style={{ backgroundColor: player.color || DEFAULT_AVATAR_COLOR }}
        >
          {initials}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">{player.name}</h3>
          {player.nickname ? <p className="text-sm text-zinc-400">@{player.nickname}</p> : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="arena-badge border-cyan-400/20 bg-cyan-400/10 text-cyan-200">{player.team}</span>
            <span className="arena-badge">{player.platform || "Plataforma livre"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 sm:justify-end">
        <button type="button" onClick={() => onEdit(player)} className="arena-button-secondary px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
          Editar
        </button>

        {onRemove ? (
          <button
            type="button"
            onClick={() => onRemove(player.id)}
            disabled={removeDisabled}
            className="arena-button-danger px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remover
          </button>
        ) : null}
      </div>
    </article>
  );
}
