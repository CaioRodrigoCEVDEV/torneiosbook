"use server";

import { redirect } from "next/navigation";
import {
  addPlayerToTournament,
  clearKnockoutMatchResult,
  clearLeagueMatchResult,
  createTournament,
  deletePlayer,
  deleteTournament,
  generateKnockoutStage,
  generateLeagueStage,
  saveKnockoutMatchResult,
  saveLeagueMatchResult,
  updatePlayer,
  updateTournament,
} from "./tournament-service";
import { authenticateAdmin, clearAdminSession, requireAdmin, setAdminSession } from "./auth";
import { ValidationError, readBoolean, readNonNegativeInteger, readOptionalText, readPlatform, readRequiredText } from "./validations";

function redirectWithError(path: string, message: string): never {
  const query = new URLSearchParams({ error: message });
  redirect(`${path}?${query.toString()}`);
}

function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function safeRedirectPath(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

async function ensureAdmin() {
  await requireAdmin();
}

export async function loginAdminAction(formData: FormData) {
  const email = readRequiredText(formData, "email", "Informe o e-mail.");
  const password = readRequiredText(formData, "password", "Informe a senha.");
  const redirectTo = safeRedirectPath(readOptionalText(formData, "redirectTo"), "/admin");
  const admin = await authenticateAdmin(email, password);

  if (!admin) {
    redirectWithError("/admin/login", "E-mail ou senha inválidos.");
  }

  await setAdminSession(admin.id);
  redirect(redirectTo);
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createTournamentAction(formData: FormData) {
  await ensureAdmin();

  try {
    await createTournament({
      name: readRequiredText(formData, "name", "Informe o nome do torneio."),
      game: readRequiredText(formData, "game", "Informe o jogo."),
      isPublic: readBoolean(formData, "isPublic"),
    });
  } catch (error) {
    redirectWithError("/admin/torneios/novo", getActionErrorMessage(error, "Não foi possível criar o torneio."));
  }

  redirect("/admin/torneios");
}

export async function updateTournamentAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");

  try {
    await updateTournament(tournamentId, {
      name: readRequiredText(formData, "name", "Informe o nome do torneio."),
      game: readRequiredText(formData, "game", "Informe o jogo."),
      isPublic: readBoolean(formData, "isPublic"),
    });
  } catch (error) {
    redirectWithError(`/admin/torneios/${tournamentId}`, getActionErrorMessage(error, "Não foi possível atualizar o torneio."));
  }

  redirect(`/admin/torneios/${tournamentId}`);
}

export async function deleteTournamentAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");

  try {
    await deleteTournament(tournamentId);
  } catch (error) {
    redirectWithError("/admin/torneios", getActionErrorMessage(error, "Não foi possível remover o torneio."));
  }

  redirect("/admin/torneios");
}

export async function addPlayerAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");

  try {
    await addPlayerToTournament(tournamentId, {
      name: readRequiredText(formData, "name", "Informe o nome do jogador."),
      nickname: readOptionalText(formData, "nickname"),
      team: readRequiredText(formData, "team", "Informe o time do jogador."),
      platform: readPlatform(formData, "platform"),
    });
  } catch (error) {
    redirectWithError(
      `/admin/torneios/${tournamentId}/jogadores`,
      getActionErrorMessage(error, "Não foi possível adicionar o jogador."),
    );
  }

  redirect(`/admin/torneios/${tournamentId}/jogadores`);
}

export async function updatePlayerAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");
  const playerId = readRequiredText(formData, "playerId", "Jogador inválido.");

  try {
    await updatePlayer(playerId, {
      name: readRequiredText(formData, "name", "Informe o nome do jogador."),
      nickname: readOptionalText(formData, "nickname"),
      team: readRequiredText(formData, "team", "Informe o time do jogador."),
      platform: readPlatform(formData, "platform"),
    });
  } catch (error) {
    redirectWithError(
      `/admin/torneios/${tournamentId}/jogadores`,
      getActionErrorMessage(error, "Não foi possível atualizar o jogador."),
    );
  }

  redirect(`/admin/torneios/${tournamentId}/jogadores`);
}

export async function deletePlayerAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");
  const playerId = readRequiredText(formData, "playerId", "Jogador inválido.");

  try {
    await deletePlayer(playerId);
  } catch (error) {
    redirectWithError(
      `/admin/torneios/${tournamentId}/jogadores`,
      getActionErrorMessage(error, "Não foi possível remover o jogador."),
    );
  }

  redirect(`/admin/torneios/${tournamentId}/jogadores`);
}

export async function generateLeagueStageAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");

  try {
    await generateLeagueStage(tournamentId);
  } catch (error) {
    redirectWithError(
      `/admin/torneios/${tournamentId}/jogadores`,
      getActionErrorMessage(error, "Não foi possível gerar a fase de grupos."),
    );
  }

  redirect(`/admin/torneios/${tournamentId}/partidas`);
}

export async function saveLeagueMatchResultAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");
  const matchId = readRequiredText(formData, "matchId", "Partida inválida.");

  try {
    await saveLeagueMatchResult(
      matchId,
      readNonNegativeInteger(formData, "homeScore", "Informe placares inteiros e não negativos."),
      readNonNegativeInteger(formData, "awayScore", "Informe placares inteiros e não negativos."),
    );
  } catch (error) {
    redirectWithError(
      `/admin/torneios/${tournamentId}/partidas`,
      getActionErrorMessage(error, "Não foi possível salvar o resultado."),
    );
  }

  redirect(`/admin/torneios/${tournamentId}/partidas`);
}

export async function clearLeagueMatchResultAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");
  const matchId = readRequiredText(formData, "matchId", "Partida inválida.");

  try {
    await clearLeagueMatchResult(matchId);
  } catch (error) {
    redirectWithError(
      `/admin/torneios/${tournamentId}/partidas`,
      getActionErrorMessage(error, "Não foi possível limpar o resultado."),
    );
  }

  redirect(`/admin/torneios/${tournamentId}/partidas`);
}

export async function generateKnockoutStageAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");

  try {
    await generateKnockoutStage(tournamentId);
  } catch (error) {
    redirectWithError(
      `/admin/torneios/${tournamentId}/partidas`,
      getActionErrorMessage(error, "Não foi possível gerar o mata-mata."),
    );
  }

  redirect(`/admin/torneios/${tournamentId}/mata-mata`);
}

export async function saveKnockoutMatchResultAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");
  const matchId = readRequiredText(formData, "matchId", "Partida inválida.");

  try {
    await saveKnockoutMatchResult(
      matchId,
      readNonNegativeInteger(formData, "homeScore", "Informe placares inteiros e não negativos."),
      readNonNegativeInteger(formData, "awayScore", "Informe placares inteiros e não negativos."),
      readOptionalText(formData, "winnerPlayerId"),
    );
  } catch (error) {
    redirectWithError(
      `/admin/torneios/${tournamentId}/mata-mata`,
      getActionErrorMessage(error, "Não foi possível salvar o resultado."),
    );
  }

  redirect(`/admin/torneios/${tournamentId}/mata-mata`);
}

export async function clearKnockoutMatchResultAction(formData: FormData) {
  await ensureAdmin();

  const tournamentId = readRequiredText(formData, "tournamentId", "Torneio inválido.");
  const matchId = readRequiredText(formData, "matchId", "Partida inválida.");

  try {
    await clearKnockoutMatchResult(matchId);
  } catch (error) {
    redirectWithError(
      `/admin/torneios/${tournamentId}/mata-mata`,
      getActionErrorMessage(error, "Não foi possível limpar o resultado."),
    );
  }

  redirect(`/admin/torneios/${tournamentId}/mata-mata`);
}
