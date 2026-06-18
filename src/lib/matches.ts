import { DEFAULT_PLAYER_LIMIT, PHASE_LABELS } from "./constants";
import type { KnockoutMatch, Match, Standing } from "./types";
import { createId, nowIso } from "./utils";
import { sortStandings } from "./standings";

function buildLeagueMatch(homePlayerId: string, awayPlayerId: string, round: number): Match {
  const timestamp = nowIso();

  return {
    id: createId("match"),
    round,
    phase: "league",
    homePlayerId,
    awayPlayerId,
    homeScore: null,
    awayScore: null,
    status: "pending",
    winnerPlayerId: null,
    decidedByPenalties: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function buildKnockoutMatch(
  bracket: KnockoutMatch["bracket"],
  phase: KnockoutMatch["phase"],
  round: number,
  homePlayerId: string,
  awayPlayerId: string,
  createdAt = nowIso(),
): KnockoutMatch {
  return {
    id: createId("match"),
    round,
    phase,
    bracket,
    homePlayerId,
    awayPlayerId,
    homeScore: null,
    awayScore: null,
    status: "pending",
    winnerPlayerId: null,
    decidedByPenalties: false,
    createdAt,
    updatedAt: createdAt,
  };
}

export function generateLeagueMatches(players: { id: string }[]): Match[] {
  if (players.length !== DEFAULT_PLAYER_LIMIT || players.length % 2 !== 0) {
    return [];
  }

  const roster = players.map((player) => player.id);
  const rounds = roster.length - 1;
  let rotating = roster.slice(1);
  const anchor = roster[0];
  const matches: Match[] = [];

  for (let round = 1; round <= rounds; round += 1) {
    const lineup = [anchor, ...rotating];

    for (let index = 0; index < lineup.length / 2; index += 1) {
      const left = lineup[index];
      const right = lineup[lineup.length - 1 - index];
      const swap = (round + index) % 2 === 0;
      matches.push(buildLeagueMatch(swap ? right : left, swap ? left : right, round));
    }

    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, rotating.length - 1)];
  }

  return matches;
}

export function getMatchWinner(match: Match | KnockoutMatch): string | null {
  if (match.homeScore === null || match.awayScore === null) {
    return null;
  }

  if (match.homeScore > match.awayScore) {
    return match.homePlayerId;
  }

  if (match.homeScore < match.awayScore) {
    return match.awayPlayerId;
  }

  if (match.phase === "league") {
    return null;
  }

  return match.winnerPlayerId ?? null;
}

export function allLeagueMatchesFinished(matches: Match[]): boolean {
  const leagueMatches = matches.filter((match) => match.phase === "league");

  return leagueMatches.length > 0 && leagueMatches.every((match) => match.status === "finished");
}

export function generateKnockoutMatches(standings: Standing[]): KnockoutMatch[] {
  const ordered = sortStandings(standings).slice(0, 4);

  if (ordered.length < 4) {
    return [];
  }

  return [
    buildKnockoutMatch("semifinal_1", "semifinal", 1, ordered[0].playerId, ordered[3].playerId),
    buildKnockoutMatch("semifinal_2", "semifinal", 1, ordered[1].playerId, ordered[2].playerId),
  ];
}

function matchSortWeight(match: KnockoutMatch): number {
  if (match.bracket === "semifinal_1") {
    return 0;
  }

  if (match.bracket === "semifinal_2") {
    return 1;
  }

  if (match.bracket === "final") {
    return 2;
  }

  return 3;
}

export function generateFinalFromSemifinals(knockoutMatches: KnockoutMatch[]): KnockoutMatch[] {
  const semifinals = knockoutMatches
    .filter((match) => match.phase === "semifinal")
    .sort((left, right) => matchSortWeight(left) - matchSortWeight(right));

  const finalists = semifinals
    .map((match) => getMatchWinner(match))
    .filter((winner): winner is string => Boolean(winner));

  const existingFinal = knockoutMatches.find((match) => match.phase === "final") ?? null;

  if (finalists.length < 2) {
    if (!existingFinal || existingFinal.status === "finished") {
      return knockoutMatches;
    }

    return knockoutMatches.filter((match) => match.phase !== "final");
  }

  if (existingFinal && existingFinal.status === "finished") {
    return knockoutMatches;
  }

  const [homePlayerId, awayPlayerId] = finalists;
  const timestamp = nowIso();

  const nextFinal: KnockoutMatch = existingFinal
    ? {
        ...existingFinal,
        homePlayerId,
        awayPlayerId,
        homeScore: existingFinal.homePlayerId === homePlayerId && existingFinal.awayPlayerId === awayPlayerId ? existingFinal.homeScore : null,
        awayScore: existingFinal.homePlayerId === homePlayerId && existingFinal.awayPlayerId === awayPlayerId ? existingFinal.awayScore : null,
        winnerPlayerId: existingFinal.homePlayerId === homePlayerId && existingFinal.awayPlayerId === awayPlayerId ? existingFinal.winnerPlayerId ?? null : null,
        decidedByPenalties: existingFinal.homePlayerId === homePlayerId && existingFinal.awayPlayerId === awayPlayerId ? Boolean(existingFinal.decidedByPenalties) : false,
        updatedAt: timestamp,
      }
    : buildKnockoutMatch("final", "final", 2, homePlayerId, awayPlayerId, timestamp);

  const withoutFinal = knockoutMatches.filter((match) => match.phase !== "final");

  return [...withoutFinal, nextFinal];
}

export function getChampion(knockoutMatches: KnockoutMatch[]): string | null {
  const final = knockoutMatches.find((match) => match.phase === "final") ?? null;

  if (!final || final.status !== "finished") {
    return null;
  }

  return getMatchWinner(final);
}

export function phaseLabel(phase: Match["phase"]) {
  return PHASE_LABELS[phase];
}
