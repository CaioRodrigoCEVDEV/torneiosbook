import type { Championship, Player, Standing } from "./types";

export function calculateStandings(championship: Championship): Standing[] {
  const standings = new Map<string, Standing>();

  championship.players.forEach((player) => {
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

  championship.matches
    .filter((match) => match.phase === "league" && match.status === "finished")
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

export interface StandingsSummary {
  leader: Standing | null;
  bestAttack: Standing | null;
  bestDefense: Standing | null;
  bestGoalDifference: Standing | null;
}

function topBy(standings: Standing[], compare: (left: Standing, right: Standing) => number) {
  return [...standings].sort(compare)[0] ?? null;
}

export function getStandingsSummary(standings: Standing[]): StandingsSummary {
  const orderedStandings = sortStandings(standings);
  const activeStandings = orderedStandings.filter((standing) => standing.played > 0);

  return {
    leader: activeStandings[0] ?? null,
    bestAttack: topBy(activeStandings, (left, right) => {
      if (right.goalsFor !== left.goalsFor) {
        return right.goalsFor - left.goalsFor;
      }

      return left.playerId.localeCompare(right.playerId);
    }),
    bestDefense: topBy(activeStandings, (left, right) => {
      if (left.goalsAgainst !== right.goalsAgainst) {
        return left.goalsAgainst - right.goalsAgainst;
      }

      return left.playerId.localeCompare(right.playerId);
    }),
    bestGoalDifference: topBy(activeStandings, (left, right) => {
      if (right.goalDifference !== left.goalDifference) {
        return right.goalDifference - left.goalDifference;
      }

      return left.playerId.localeCompare(right.playerId);
    }),
  };
}

export function playerById(players: Player[]): Record<string, Player> {
  return Object.fromEntries(players.map((player) => [player.id, player]));
}
