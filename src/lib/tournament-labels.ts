import type { MatchPhase, MatchStatus, PlayerPlatform, TournamentFormat, TournamentStatus } from "./tournament-types";

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  SETUP: "Configuração",
  LEAGUE: "Fase de grupos",
  KNOCKOUT: "Mata-mata",
  FINISHED: "Finalizado",
};

export const TOURNAMENT_FORMAT_LABELS: Record<TournamentFormat, string> = {
  LEAGUE_TOP4_KNOCKOUT: "Pontos corridos + top 4",
};

export const MATCH_PHASE_LABELS: Record<MatchPhase, string> = {
  LEAGUE: "Fase de grupos",
  SEMIFINAL: "Semifinal",
  FINAL: "Final",
  THIRD_PLACE: "3º lugar",
};

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  PENDING: "Pendente",
  FINISHED: "Finalizada",
};

export const PLAYER_PLATFORM_LABELS: Record<PlayerPlatform, string> = {
  PS5: "PS5",
  XBOX: "Xbox",
  PC: "PC",
};
