export type ChampionshipStatus = "configuration" | "in_progress" | "knockout" | "finished";

export type ChampionshipFormat = "league_knockout";

export type MatchPhase = "league" | "semifinal" | "final" | "third_place";

export type MatchStatus = "pending" | "finished";

export type PlayerPlatform = "PS5" | "Xbox" | "PC";

export type KnockoutBracket = "semifinal_1" | "semifinal_2" | "final" | "third_place";

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  team: string;
  platform?: PlayerPlatform;
  color?: string;
  createdAt: string;
}

export interface Match {
  id: string;
  round: number;
  phase: MatchPhase;
  homePlayerId: string;
  awayPlayerId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  winnerPlayerId?: string | null;
  decidedByPenalties?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KnockoutMatch extends Match {
  bracket: KnockoutBracket;
}

export interface Standing {
  playerId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Championship {
  id: string;
  name: string;
  game: string;
  format: ChampionshipFormat;
  status: ChampionshipStatus;
  createdAt: string;
  updatedAt: string;
  players: Player[];
  matches: Match[];
  knockoutMatches: KnockoutMatch[];
}
