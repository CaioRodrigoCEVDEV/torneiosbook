import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  allLeagueMatchesFinished,
  calculateStandings,
  generateFinalFromSemifinals,
  generateKnockoutMatches,
  generateLeagueMatches,
  getChampion,
  getMatchWinner,
  getStandingsSummary,
  groupMatchesByRound,
  sortStandings,
} from "./tournament-rules";
import type {
  AdminDashboardData,
  Match,
  MatchPhase,
  MatchStatus,
  Player,
  PlayerPlatform,
  Tournament,
  TournamentContext,
  TournamentFormat,
  TournamentListItem,
  TournamentStatus,
} from "./tournament-types";
import { ValidationError } from "./validations";

type PrismaTournament = Prisma.TournamentGetPayload<Prisma.TournamentDefaultArgs>;
type PrismaPlayer = Prisma.PlayerGetPayload<Prisma.PlayerDefaultArgs>;
type PrismaMatch = Prisma.MatchGetPayload<Prisma.MatchDefaultArgs>;

interface PlayerInput {
  name: string;
  nickname: string | null;
  team: string;
  platform: PlayerPlatform | null;
}

interface TournamentInput {
  name: string;
  game: string;
  isPublic: boolean;
}

function mapPlayer(player: PrismaPlayer): Player {
  return {
    id: player.id,
    tournamentId: player.tournamentId,
    name: player.name,
    nickname: player.nickname,
    team: player.team,
    platform: player.platform as PlayerPlatform | null,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString(),
  };
}

function mapMatch(match: PrismaMatch): Match {
  return {
    id: match.id,
    tournamentId: match.tournamentId,
    round: match.round,
    phase: match.phase as MatchPhase,
    homePlayerId: match.homePlayerId,
    awayPlayerId: match.awayPlayerId,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    status: match.status as MatchStatus,
    winnerPlayerId: match.winnerPlayerId,
    decidedByPenalties: match.decidedByPenalties,
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
  };
}

function mapTournament(tournament: PrismaTournament, players: PrismaPlayer[], matches: PrismaMatch[]): Tournament {
  return {
    id: tournament.id,
    name: tournament.name,
    game: tournament.game,
    format: tournament.format as TournamentFormat,
    status: tournament.status as TournamentStatus,
    isPublic: tournament.isPublic,
    createdAt: tournament.createdAt.toISOString(),
    updatedAt: tournament.updatedAt.toISOString(),
    players: players.map(mapPlayer),
    matches: matches.map(mapMatch),
  };
}

function matchOrder(left: Match, right: Match) {
  const roundLeft = left.round ?? 0;
  const roundRight = right.round ?? 0;

  if (roundLeft !== roundRight) {
    return roundLeft - roundRight;
  }

  return Date.parse(left.createdAt) - Date.parse(right.createdAt);
}

export function buildTournamentContext(tournament: Tournament): TournamentContext {
  const playersById = Object.fromEntries(tournament.players.map((player) => [player.id, player]));
  const standings = sortStandings(calculateStandings(tournament));
  const summary = getStandingsSummary(standings);
  const leagueMatches = tournament.matches.filter((match) => match.phase === "LEAGUE").sort(matchOrder);
  const knockoutMatches = tournament.matches.filter((match) => match.phase !== "LEAGUE").sort(matchOrder);
  const semifinals = knockoutMatches.filter((match) => match.phase === "SEMIFINAL");
  const finalMatch = knockoutMatches.find((match) => match.phase === "FINAL") ?? null;
  const championId = getChampion(tournament.matches);

  const leader = summary.leader ? playersById[summary.leader.playerId] ?? null : null;
  const bestAttack = summary.bestAttack ? playersById[summary.bestAttack.playerId] ?? null : null;
  const bestDefense = summary.bestDefense ? playersById[summary.bestDefense.playerId] ?? null : null;
  const bestGoalDifference = summary.bestGoalDifference ? playersById[summary.bestGoalDifference.playerId] ?? null : null;
  const champion = championId ? playersById[championId] ?? null : null;

  const totalMatches = tournament.matches.length;
  const finishedMatches = tournament.matches.filter((match) => match.status === "FINISHED").length;
  const pendingMatches = totalMatches - finishedMatches;

  return {
    tournament,
    playersById,
    standings,
    summary,
    leader,
    bestAttack,
    bestDefense,
    bestGoalDifference,
    champion,
    totalMatches,
    finishedMatches,
    pendingMatches,
    leagueMatchesByRound: groupMatchesByRound(leagueMatches),
    leagueMatches,
    knockoutMatches,
    semifinals,
    finalMatch,
    leagueFinished: allLeagueMatchesFinished(tournament.matches),
    canGenerateKnockout: allLeagueMatchesFinished(tournament.matches) && knockoutMatches.length === 0,
  };
}

async function loadTournament(id: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
  });

  if (!tournament) {
    return null;
  }

  const [players, matches] = await Promise.all([
    prisma.player.findMany({
      where: { tournamentId: id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.match.findMany({
      where: { tournamentId: id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return mapTournament(tournament, players, matches);
}

async function loadTournamentWithRelations(id: string) {
  return loadTournament(id);
}

export async function getTournamentById(id: string) {
  return loadTournamentWithRelations(id);
}

export async function getPublicTournamentById(id: string) {
  const tournament = await loadTournamentWithRelations(id);

  if (!tournament || !tournament.isPublic) {
    return null;
  }

  return tournament;
}

export async function listTournaments(publicOnly = false): Promise<TournamentListItem[]> {
  const tournaments = await prisma.tournament.findMany({
    where: publicOnly ? { isPublic: true } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      players: true,
      matches: true,
    },
  });

  return tournaments.map((tournament) => {
    return {
      id: tournament.id,
      name: tournament.name,
      game: tournament.game,
      format: tournament.format as TournamentFormat,
      status: tournament.status as TournamentStatus,
      isPublic: tournament.isPublic,
      createdAt: tournament.createdAt.toISOString(),
      updatedAt: tournament.updatedAt.toISOString(),
      playersCount: tournament.players.length,
      matchesCount: tournament.matches.length,
      finishedMatchesCount: tournament.matches.filter((match) => match.status === "FINISHED").length,
    };
  });
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const recentTournaments = await listTournaments(false);

  return {
    totalTournaments: recentTournaments.length,
    inProgressTournaments: recentTournaments.filter((tournament) => tournament.status === "LEAGUE" || tournament.status === "KNOCKOUT").length,
    finishedTournaments: recentTournaments.filter((tournament) => tournament.status === "FINISHED").length,
    recentTournaments: recentTournaments.slice(0, 5),
  };
}

export async function createTournament(input: TournamentInput) {
  const tournament = await prisma.tournament.create({
    data: {
      name: input.name,
      game: input.game,
      isPublic: input.isPublic,
      format: "LEAGUE_TOP4_KNOCKOUT",
      status: "SETUP",
    },
  });

  return tournament.id;
}

export async function updateTournament(tournamentId: string, input: TournamentInput) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      name: input.name,
      game: input.game,
      isPublic: input.isPublic,
    },
  });
}

export async function deleteTournament(tournamentId: string) {
  await prisma.tournament.delete({
    where: { id: tournamentId },
  });
}

export async function addPlayerToTournament(tournamentId: string, input: PlayerInput) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { players: true, matches: true },
  });

  if (!tournament) {
    throw new ValidationError("Torneio não encontrado.");
  }

  if (tournament.matches.length > 0) {
    throw new ValidationError("Não é possível alterar jogadores depois que as partidas foram geradas.");
  }

  if (tournament.players.length >= 6) {
    throw new ValidationError("O limite de 6 jogadores foi atingido.");
  }

  await prisma.player.create({
    data: {
      tournamentId,
      name: input.name,
      nickname: input.nickname,
      team: input.team,
      platform: input.platform,
    },
  });
}

export async function updatePlayer(playerId: string, input: PlayerInput) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { tournament: { include: { matches: true } } },
  });

  if (!player) {
    throw new ValidationError("Jogador não encontrado.");
  }

  if (player.tournament.matches.length > 0) {
    throw new ValidationError("Não é possível alterar jogadores depois que as partidas foram geradas.");
  }

  await prisma.player.update({
    where: { id: playerId },
    data: {
      name: input.name,
      nickname: input.nickname,
      team: input.team,
      platform: input.platform,
    },
  });
}

export async function deletePlayer(playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { tournament: { include: { matches: true } } },
  });

  if (!player) {
    throw new ValidationError("Jogador não encontrado.");
  }

  if (player.tournament.matches.length > 0) {
    throw new ValidationError("Não é possível remover jogadores depois que as partidas foram geradas.");
  }

  await prisma.player.delete({
    where: { id: playerId },
  });
}

export async function generateLeagueStage(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { players: true, matches: true },
  });

  if (!tournament) {
    throw new ValidationError("Torneio não encontrado.");
  }

  if (tournament.players.length !== 6) {
    throw new ValidationError("É necessário cadastrar 6 jogadores para gerar as partidas.");
  }

  if (tournament.matches.length > 0) {
    throw new ValidationError("As partidas já foram geradas.");
  }

  const serialized = mapTournament(tournament, tournament.players, tournament.matches);
  const seeds = generateLeagueMatches(serialized.players.map((player) => ({ id: player.id })));

  await prisma.$transaction(async (tx) => {
    await tx.match.createMany({
      data: seeds.map((seed) => ({
        tournamentId,
        round: seed.round,
        phase: seed.phase,
        homePlayerId: seed.homePlayerId,
        awayPlayerId: seed.awayPlayerId,
        homeScore: seed.homeScore,
        awayScore: seed.awayScore,
        status: seed.status,
        winnerPlayerId: seed.winnerPlayerId,
        decidedByPenalties: seed.decidedByPenalties,
      })),
    });

    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: "LEAGUE" },
    });
  });
}

export async function saveLeagueMatchResult(matchId: string, homeScore: number, awayScore: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: { include: { players: true, matches: true } } },
  });

  if (!match) {
    throw new ValidationError("Partida não encontrada.");
  }

  if (match.phase !== "LEAGUE") {
    throw new ValidationError("Essa partida não pertence à fase de grupos.");
  }

  if (match.tournament.status === "KNOCKOUT" || match.tournament.status === "FINISHED") {
    throw new ValidationError("Não é possível editar partidas após o início do mata-mata.");
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
      status: "FINISHED",
      winnerPlayerId: homeScore === awayScore ? null : homeScore > awayScore ? match.homePlayerId : match.awayPlayerId,
      decidedByPenalties: false,
    },
  });

  await prisma.tournament.update({
    where: { id: match.tournamentId },
    data: { status: "LEAGUE" },
  });
}

export async function clearLeagueMatchResult(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw new ValidationError("Partida não encontrada.");
  }

  if (match.phase !== "LEAGUE") {
    throw new ValidationError("Essa partida não pertence à fase de grupos.");
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: null,
      awayScore: null,
      status: "PENDING",
      winnerPlayerId: null,
      decidedByPenalties: false,
    },
  });
}

export async function generateKnockoutStage(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { players: true, matches: true },
  });

  if (!tournament) {
    throw new ValidationError("Torneio não encontrado.");
  }

  const serialized = mapTournament(tournament, tournament.players, tournament.matches);

  if (!allLeagueMatchesFinished(serialized.matches)) {
    throw new ValidationError("Finalize todas as partidas da fase de grupos antes de gerar o mata-mata.");
  }

  if (serialized.matches.some((match) => match.phase !== "LEAGUE")) {
    throw new ValidationError("O mata-mata já foi gerado.");
  }

  const standings = sortStandings(calculateStandings(serialized));

  const seeds = generateKnockoutMatches(standings);

  if (seeds.length === 0) {
    throw new ValidationError("Não foi possível gerar o mata-mata.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.match.createMany({
      data: seeds.map((seed) => ({
        tournamentId,
        round: seed.round,
        phase: seed.phase,
        homePlayerId: seed.homePlayerId,
        awayPlayerId: seed.awayPlayerId,
        homeScore: seed.homeScore,
        awayScore: seed.awayScore,
        status: seed.status,
        winnerPlayerId: seed.winnerPlayerId,
        decidedByPenalties: seed.decidedByPenalties,
      })),
    });

    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: "KNOCKOUT" },
    });
  });
}

async function syncKnockoutBracket(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { players: true, matches: true },
  });

  if (!tournament) {
    throw new ValidationError("Torneio não encontrado.");
  }

  const serialized = mapTournament(tournament, tournament.players, tournament.matches);
  const knockoutMatches = serialized.matches.filter((match) => match.phase !== "LEAGUE");
  const semifinals = knockoutMatches.filter((match) => match.phase === "SEMIFINAL");
  const finalMatch = knockoutMatches.find((match) => match.phase === "FINAL") ?? null;
  const finalSeed = generateFinalFromSemifinals(semifinals);

  if (!finalSeed) {
    if (finalMatch && finalMatch.status !== "FINISHED") {
      await prisma.match.delete({ where: { id: finalMatch.id } });
    }

    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "KNOCKOUT" },
    });
    return;
  }

  if (!finalMatch) {
    await prisma.match.create({
      data: {
        tournamentId,
        round: finalSeed.round,
        phase: finalSeed.phase,
        homePlayerId: finalSeed.homePlayerId,
        awayPlayerId: finalSeed.awayPlayerId,
        homeScore: finalSeed.homeScore,
        awayScore: finalSeed.awayScore,
        status: finalSeed.status,
        winnerPlayerId: finalSeed.winnerPlayerId,
        decidedByPenalties: finalSeed.decidedByPenalties,
      },
    });

    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "KNOCKOUT" },
    });
    return;
  }

  const participantsChanged = finalMatch.homePlayerId !== finalSeed.homePlayerId || finalMatch.awayPlayerId !== finalSeed.awayPlayerId;

  if (participantsChanged) {
    await prisma.match.update({
      where: { id: finalMatch.id },
      data: {
        homePlayerId: finalSeed.homePlayerId,
        awayPlayerId: finalSeed.awayPlayerId,
        homeScore: null,
        awayScore: null,
        status: "PENDING",
        winnerPlayerId: null,
        decidedByPenalties: false,
      },
    });
  }

  const refreshedFinal = await prisma.match.findUnique({ where: { id: finalMatch.id } });

  if (refreshedFinal?.status === "FINISHED" && getMatchWinner(mapMatch(refreshedFinal))) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "FINISHED" },
    });
    return;
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "KNOCKOUT" },
  });
}

export async function saveKnockoutMatchResult(matchId: string, homeScore: number, awayScore: number, winnerPlayerId?: string | null) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw new ValidationError("Partida não encontrada.");
  }

  if (match.phase === "LEAGUE") {
    throw new ValidationError("Essa partida pertence à fase de grupos.");
  }

  if (homeScore === awayScore && !winnerPlayerId) {
    throw new ValidationError("Selecione o vencedor nos pênaltis.");
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
      status: "FINISHED",
      winnerPlayerId: homeScore === awayScore ? winnerPlayerId : homeScore > awayScore ? match.homePlayerId : match.awayPlayerId,
      decidedByPenalties: homeScore === awayScore,
    },
  });

  await syncKnockoutBracket(match.tournamentId);
}

export async function clearKnockoutMatchResult(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw new ValidationError("Partida não encontrada.");
  }

  if (match.phase === "LEAGUE") {
    throw new ValidationError("Essa partida pertence à fase de grupos.");
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: null,
      awayScore: null,
      status: "PENDING",
      winnerPlayerId: null,
      decidedByPenalties: false,
    },
  });

  await syncKnockoutBracket(match.tournamentId);
}

export async function getTournamentContext(id: string, publicOnly = false): Promise<TournamentContext | null> {
  const tournament = await loadTournament(id);

  if (!tournament || (publicOnly && !tournament.isPublic)) {
    return null;
  }

  return buildTournamentContext(tournament);
}

export async function getPublicTournaments() {
  return listTournaments(true);
}

export async function getAdminTournaments() {
  return listTournaments(false);
}

export async function getAdminDashboard() {
  return getAdminDashboardData();
}

export async function getTournamentBasic(id: string) {
  return loadTournament(id);
}
