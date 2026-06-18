export type TournamentStatus = "SETUP" | "LEAGUE" | "KNOCKOUT" | "FINISHED";

export type TournamentFormat = "LEAGUE_TOP4_KNOCKOUT";

export type MatchPhase = "LEAGUE" | "SEMIFINAL" | "FINAL" | "THIRD_PLACE";

export type MatchStatus = "PENDING" | "FINISHED";

export type PlayerPlatform = "PS5" | "XBOX" | "PC";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  tournamentId: string;
  name: string;
  nickname: string | null;
  team: string;
  platform: PlayerPlatform | null;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number | null;
  phase: MatchPhase;
  homePlayerId: string;
  awayPlayerId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  winnerPlayerId: string | null;
  decidedByPenalties: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  format: TournamentFormat;
  status: TournamentStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  players: Player[];
  matches: Match[];
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

export interface TournamentSummary {
  leader: Standing | null;
  bestAttack: Standing | null;
  bestDefense: Standing | null;
  bestGoalDifference: Standing | null;
}

export interface TournamentListItem {
  id: string;
  name: string;
  game: string;
  format: TournamentFormat;
  status: TournamentStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  playersCount: number;
  matchesCount: number;
  finishedMatchesCount: number;
}

export interface AdminDashboardData {
  totalTournaments: number;
  inProgressTournaments: number;
  finishedTournaments: number;
  recentTournaments: TournamentListItem[];
}

export interface TournamentContext {
  tournament: Tournament;
  playersById: Record<string, Player>;
  standings: Standing[];
  summary: TournamentSummary;
  leader: Player | null;
  bestAttack: Player | null;
  bestDefense: Player | null;
  bestGoalDifference: Player | null;
  champion: Player | null;
  totalMatches: number;
  finishedMatches: number;
  pendingMatches: number;
  leagueMatchesByRound: Record<number, Match[]>;
  leagueMatches: Match[];
  knockoutMatches: Match[];
  semifinals: Match[];
  finalMatch: Match | null;
  leagueFinished: boolean;
  canGenerateKnockout: boolean;
}
