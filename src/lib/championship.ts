import { DEFAULT_AVATAR_COLOR, DEFAULT_FORMAT, DEFAULT_GAME, DEFAULT_PLAYER_LIMIT } from "./constants";
import { allLeagueMatchesFinished, generateFinalFromSemifinals, generateKnockoutMatches, generateLeagueMatches, getChampion } from "./matches";
import { calculateStandings, sortStandings } from "./standings";
import type { Championship, KnockoutMatch, Match, Player, PlayerPlatform } from "./types";
import { createId, nowIso } from "./utils";

const AVATAR_COLORS = [
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
];

function normalizeText(value?: string | null) {
  return value?.trim() ?? "";
}

function normalizeOptionalText(value?: string | null) {
  const text = normalizeText(value);
  return text.length > 0 ? text : undefined;
}

function defaultColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length] ?? DEFAULT_AVATAR_COLOR;
}

function finishLeagueMatch(match: Match, homeScore: number, awayScore: number, updatedAt: string): Match {
  const winnerPlayerId = homeScore > awayScore ? match.homePlayerId : awayScore > homeScore ? match.awayPlayerId : null;

  return {
    ...match,
    homeScore,
    awayScore,
    status: "finished",
    winnerPlayerId,
    decidedByPenalties: false,
    updatedAt,
  };
}

function clearLeagueMatch(match: Match, updatedAt: string): Match {
  return {
    ...match,
    homeScore: null,
    awayScore: null,
    status: "pending",
    winnerPlayerId: null,
    decidedByPenalties: false,
    updatedAt,
  };
}

function finishKnockoutMatch(
  match: KnockoutMatch,
  homeScore: number,
  awayScore: number,
  winnerPlayerId: string | null | undefined,
  updatedAt: string,
): KnockoutMatch {
  const tie = homeScore === awayScore;
  const winner = tie ? winnerPlayerId ?? null : homeScore > awayScore ? match.homePlayerId : match.awayPlayerId;

  if (!winner && tie) {
    return match;
  }

  return {
    ...match,
    homeScore,
    awayScore,
    status: "finished",
    winnerPlayerId: winner,
    decidedByPenalties: tie,
    updatedAt,
  };
}

function clearKnockoutMatch(match: KnockoutMatch, updatedAt: string): KnockoutMatch {
  return {
    ...match,
    homeScore: null,
    awayScore: null,
    status: "pending",
    winnerPlayerId: null,
    decidedByPenalties: false,
    updatedAt,
  };
}

export interface PlayerDraft {
  id?: string;
  name: string;
  nickname?: string;
  team: string;
  platform?: PlayerPlatform | "";
  color?: string;
}

export function createChampionship(name: string, game = DEFAULT_GAME): Championship {
  const timestamp = nowIso();

  return {
    id: createId("championship"),
    name: normalizeText(name),
    game: normalizeText(game) || DEFAULT_GAME,
    format: DEFAULT_FORMAT,
    status: "configuration",
    createdAt: timestamp,
    updatedAt: timestamp,
    players: [],
    matches: [],
    knockoutMatches: [],
  };
}

export function upsertPlayer(championship: Championship, draft: PlayerDraft): Championship {
  const name = normalizeText(draft.name);
  const team = normalizeText(draft.team);

  if (!name || !team) {
    return championship;
  }

  const timestamp = nowIso();

  if (draft.id) {
    const nextPlayers = championship.players.map((player) =>
      player.id === draft.id
        ? {
            ...player,
            name,
            nickname: normalizeOptionalText(draft.nickname),
            team,
            platform: draft.platform || undefined,
            color: normalizeText(draft.color) || player.color,
          }
        : player,
    );

    return {
      ...championship,
      players: nextPlayers,
      updatedAt: timestamp,
    };
  }

  if (championship.players.length >= DEFAULT_PLAYER_LIMIT) {
    return championship;
  }

  const player: Player = {
    id: createId("player"),
    name,
    nickname: normalizeOptionalText(draft.nickname),
    team,
    platform: draft.platform || undefined,
    color: normalizeText(draft.color) || defaultColor(championship.players.length),
    createdAt: timestamp,
  };

  return {
    ...championship,
    players: [...championship.players, player],
    updatedAt: timestamp,
  };
}

export function removePlayer(championship: Championship, playerId: string): Championship {
  if (championship.matches.length > 0 || championship.knockoutMatches.length > 0) {
    return championship;
  }

  const nextPlayers = championship.players.filter((player) => player.id !== playerId);

  if (nextPlayers.length === championship.players.length) {
    return championship;
  }

  return {
    ...championship,
    players: nextPlayers,
    updatedAt: nowIso(),
  };
}

export function generateLeagueStage(championship: Championship): Championship {
  if (championship.players.length !== DEFAULT_PLAYER_LIMIT || championship.matches.length > 0) {
    return championship;
  }

  return {
    ...championship,
    matches: generateLeagueMatches(championship.players),
    status: "in_progress",
    updatedAt: nowIso(),
  };
}

export function recordLeagueMatch(
  championship: Championship,
  matchId: string,
  homeScore: number,
  awayScore: number,
): Championship {
  if (championship.knockoutMatches.length > 0) {
    return championship;
  }

  let changed = false;
  const timestamp = nowIso();

  const nextMatches = championship.matches.map((match) => {
    if (match.id !== matchId) {
      return match;
    }

    changed = true;
    return finishLeagueMatch(match, homeScore, awayScore, timestamp);
  });

  if (!changed) {
    return championship;
  }

  return {
    ...championship,
    matches: nextMatches,
    status: "in_progress",
    updatedAt: timestamp,
  };
}

export function clearLeagueResult(championship: Championship, matchId: string): Championship {
  if (championship.knockoutMatches.length > 0) {
    return championship;
  }

  let changed = false;
  const timestamp = nowIso();

  const nextMatches = championship.matches.map((match) => {
    if (match.id !== matchId) {
      return match;
    }

    changed = true;
    return clearLeagueMatch(match, timestamp);
  });

  if (!changed) {
    return championship;
  }

  return {
    ...championship,
    matches: nextMatches,
    status: "in_progress",
    updatedAt: timestamp,
  };
}

export function generateKnockoutStage(championship: Championship): Championship {
  if (championship.knockoutMatches.length > 0 || !allLeagueMatchesFinished(championship.matches)) {
    return championship;
  }

  const standings = sortStandings(calculateStandings(championship));
  const knockoutMatches = generateKnockoutMatches(standings);

  if (knockoutMatches.length === 0) {
    return championship;
  }

  return {
    ...championship,
    knockoutMatches,
    status: "knockout",
    updatedAt: nowIso(),
  };
}

export function recordKnockoutMatch(
  championship: Championship,
  matchId: string,
  homeScore: number,
  awayScore: number,
  winnerPlayerId?: string | null,
): Championship {
  if (championship.knockoutMatches.length === 0) {
    return championship;
  }

  let changed = false;
  const timestamp = nowIso();

  const nextMatches = championship.knockoutMatches.map((match) => {
    if (match.id !== matchId) {
      return match;
    }

    changed = true;
    return finishKnockoutMatch(match, homeScore, awayScore, winnerPlayerId, timestamp);
  });

  if (!changed) {
    return championship;
  }

  const normalizedKnockoutMatches = generateFinalFromSemifinals(nextMatches);
  const champion = getChampion(normalizedKnockoutMatches);

  return {
    ...championship,
    knockoutMatches: normalizedKnockoutMatches,
    status: champion ? "finished" : "knockout",
    updatedAt: timestamp,
  };
}

export function clearKnockoutResult(championship: Championship, matchId: string): Championship {
  if (championship.knockoutMatches.length === 0) {
    return championship;
  }

  let changed = false;
  const timestamp = nowIso();

  const nextMatches = championship.knockoutMatches.map((match) => {
    if (match.id !== matchId) {
      return match;
    }

    changed = true;
    return clearKnockoutMatch(match, timestamp);
  });

  if (!changed) {
    return championship;
  }

  const normalizedKnockoutMatches = generateFinalFromSemifinals(nextMatches);
  const champion = getChampion(normalizedKnockoutMatches);

  return {
    ...championship,
    knockoutMatches: normalizedKnockoutMatches,
    status: champion ? "finished" : "knockout",
    updatedAt: timestamp,
  };
}

export function getLeagueStandings(championship: Championship) {
  return sortStandings(calculateStandings(championship));
}

export function getCurrentChampion(championship: Championship) {
  return getChampion(championship.knockoutMatches);
}
