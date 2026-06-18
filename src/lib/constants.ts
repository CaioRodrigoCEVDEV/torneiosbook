import type { ChampionshipFormat, ChampionshipStatus, MatchPhase, MatchStatus, PlayerPlatform } from "./types";

export const STORAGE_KEY = "arena-fc:championship";

export const DEFAULT_GAME = "EA FC 2026";

export const DEFAULT_PLAYER_LIMIT = 6;

export const DEFAULT_FORMAT: ChampionshipFormat = "league_knockout";

export const DEFAULT_AVATAR_COLOR = "#10b981";

export const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/campeonato", label: "Dashboard" },
  { href: "/campeonato/jogadores", label: "Jogadores" },
  { href: "/campeonato/partidas", label: "Partidas" },
  { href: "/campeonato/tabela", label: "Tabela" },
  { href: "/campeonato/mata-mata", label: "Mata-mata" },
] as const;

export const PLATFORM_OPTIONS: Array<{ value: PlayerPlatform; label: string }> = [
  { value: "PS5", label: "PS5" },
  { value: "Xbox", label: "Xbox" },
  { value: "PC", label: "PC" },
];

export const STATUS_LABELS: Record<ChampionshipStatus, string> = {
  configuration: "Configuração",
  in_progress: "Em andamento",
  knockout: "Mata-mata",
  finished: "Finalizado",
};

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  pending: "Pendente",
  finished: "Finalizada",
};

export const PHASE_LABELS: Record<MatchPhase, string> = {
  league: "Fase de grupos",
  semifinal: "Semifinal",
  final: "Final",
  third_place: "3º lugar",
};

export const FORMAT_LABEL = "Pontos corridos + mata-mata";
