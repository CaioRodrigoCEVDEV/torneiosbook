import type { Match, MatchPhase, MatchStatus, Player, Standing, Tournament, TournamentSummary } from "./tournament-types";

export interface MatchSeed {
  round: number | null;
  phase: MatchPhase;
  homePlayerId: string;
  awayPlayerId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  winnerPlayerId: string | null;
  decidedByPenalties: boolean;
}

export interface TournamentStats {
  standings: Standing[];
  summary: TournamentSummary;
  playersById: Record<string, Player>;
  leagueMatchesByRound: Record<number, Match[]>;
  leagueMatches: Match[];
  knockoutMatches: Match[];
  semifinals: Match[];
  finalMatch: Match | null;
  championPlayerId: string | null;
  totalMatches: number;
  finishedMatches: number;
  pendingMatches: number;
  leagueFinished: boolean;
  canGenerateKnockout: boolean;
}

export function generateLeagueMatches(players: Array<Pick<Player, "id">>) {
  if (players.length < 2 || players.length % 2 !== 0) {
    return [] as MatchSeed[];
  }

  const roster = players.map((player) => player.id);
  const rounds = roster.length - 1;
  let rotating = roster.slice(1);
  const anchor = roster[0];
  const matches: MatchSeed[] = [];

  for (let round = 1; round <= rounds; round += 1) {
    const lineup = [anchor, ...rotating];

    for (let index = 0; index < lineup.length / 2; index += 1) {
      const left = lineup[index];
      const right = lineup[lineup.length - 1 - index];
      const swap = (round + index) % 2 === 0;

      matches.push({
        round,
        phase: "LEAGUE",
        homePlayerId: swap ? right : left,
        awayPlayerId: swap ? left : right,
        homeScore: null,
        awayScore: null,
        status: "PENDING",
        winnerPlayerId: null,
        decidedByPenalties: false,
      });
    }

    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, rotating.length - 1)];
  }

  return matches;
}

export function calculateStandings(tournament: Pick<Tournament, "players" | "matches">): Standing[] {
  const standings = new Map<string, Standing>();

  tournament.players.forEach((player) => {
    standings.set(player.id, {
      playerId: player.id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  tournament.matches
    .filter((match) => match.phase === "LEAGUE" && match.status === "FINISHED")
    .forEach((match) => {
      const home = standings.get(match.homePlayerId);
      const away = standings.get(match.awayPlayerId);

      if (!home || !away || match.homeScore === null || match.awayScore === null) {
        return;
      }

      home.played += 1;
      away.played += 1;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.wins += 1;
        home.points += 3;
        away.losses += 1;
      } else if (match.homeScore < match.awayScore) {
        away.wins += 1;
        away.points += 3;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    });

  return Array.from(standings.values()).map((standing) => ({
    ...standing,
    goalDifference: standing.goalsFor - standing.goalsAgainst,
  }));
}

export function sortStandings(standings: Standing[]): Standing[] {
  return [...standings].sort((left, right) => {
    if (right.points !== left.points) {
      return right.points - left.points;
    }

    if (right.goalDifference !== left.goalDifference) {
      return right.goalDifference - left.goalDifference;
    }

    if (right.goalsFor !== left.goalsFor) {
      return right.goalsFor - left.goalsFor;
    }

    if (left.goalsAgainst !== right.goalsAgainst) {
      return left.goalsAgainst - right.goalsAgainst;
    }

    return left.playerId.localeCompare(right.playerId);
  });
}

export function getStandingsSummary(standings: Standing[]): TournamentSummary {
  const ordered = sortStandings(standings);

  const bestAttack = [...ordered].sort((left, right) => {
    if (right.goalsFor !== left.goalsFor) {
      return right.goalsFor - left.goalsFor;
    }

    return left.playerId.localeCompare(right.playerId);
  })[0] ?? null;

  const bestDefense = [...ordered].sort((left, right) => {
    if (left.goalsAgainst !== right.goalsAgainst) {
      return left.goalsAgainst - right.goalsAgainst;
    }

    return left.playerId.localeCompare(right.playerId);
  })[0] ?? null;

  const bestGoalDifference = [...ordered].sort((left, right) => {
    if (right.goalDifference !== left.goalDifference) {
      return right.goalDifference - left.goalDifference;
    }

    return left.playerId.localeCompare(right.playerId);
  })[0] ?? null;

  return {
    leader: ordered[0] ?? null,
    bestAttack,
    bestDefense,
    bestGoalDifference,
  };
}

export function groupMatchesByRound(matches: Match[]): Record<number, Match[]> {
  return matches.reduce<Record<number, Match[]>>((accumulator, match) => {
    const round = match.round ?? 0;

    if (!accumulator[round]) {
      accumulator[round] = [];
    }

    accumulator[round].push(match);
    return accumulator;
  }, {});
}

export function allLeagueMatchesFinished(matches: Match[]) {
  const leagueMatches = matches.filter((match) => match.phase === "LEAGUE");

  return leagueMatches.length > 0 && leagueMatches.every((match) => match.status === "FINISHED");
}

export function getMatchWinner(match: Pick<Match, "homePlayerId" | "awayPlayerId" | "homeScore" | "awayScore" | "phase" | "winnerPlayerId">) {
  if (match.homeScore === null || match.awayScore === null) {
    return null;
  }

  if (match.homeScore > match.awayScore) {
    return match.homePlayerId;
  }

  if (match.homeScore < match.awayScore) {
    return match.awayPlayerId;
  }

  if (match.phase === "LEAGUE") {
    return null;
  }

  return match.winnerPlayerId;
}

export function generateKnockoutMatches(standings: Standing[]) {
  const ordered = sortStandings(standings).slice(0, 4);

  if (ordered.length < 4) {
    return [] as MatchSeed[];
  }

  return [
    {
      round: 1,
      phase: "SEMIFINAL" as const,
      homePlayerId: ordered[0].playerId,
      awayPlayerId: ordered[3].playerId,
      homeScore: null,
      awayScore: null,
      status: "PENDING" as const,
      winnerPlayerId: null,
      decidedByPenalties: false,
    },
    {
      round: 1,
      phase: "SEMIFINAL" as const,
      homePlayerId: ordered[1].playerId,
      awayPlayerId: ordered[2].playerId,
      homeScore: null,
      awayScore: null,
      status: "PENDING" as const,
      winnerPlayerId: null,
      decidedByPenalties: false,
    },
  ] satisfies MatchSeed[];
}

export function generateFinalFromSemifinals(matches: Match[]) {
  const semifinals = matches.filter((match) => match.phase === "SEMIFINAL");

  if (semifinals.length < 2) {
    return null;
  }

  const winners = semifinals
    .map((match) => getMatchWinner(match))
    .filter((winner): winner is string => Boolean(winner));

  if (winners.length < 2) {
    return null;
  }

  return {
    round: 2,
    phase: "FINAL" as const,
    homePlayerId: winners[0],
    awayPlayerId: winners[1],
    homeScore: null,
    awayScore: null,
    status: "PENDING" as const,
    winnerPlayerId: null,
    decidedByPenalties: false,
  } satisfies MatchSeed;
}

export function getChampion(matches: Match[]) {
  const finalMatch = matches.find((match) => match.phase === "FINAL");

  if (!finalMatch || finalMatch.status !== "FINISHED") {
    return null;
  }

  return getMatchWinner(finalMatch);
}
