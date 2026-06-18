import type { PlayerPlatform } from "./tournament-types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function toStringValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function readRequiredText(formData: FormData, key: string, message: string) {
  const value = toStringValue(formData.get(key));

  if (!value) {
    throw new ValidationError(message);
  }

  return value;
}

export function readOptionalText(formData: FormData, key: string) {
  const value = toStringValue(formData.get(key));
  return value || null;
}

export function readBoolean(formData: FormData, key: string) {
  const value = toStringValue(formData.get(key)).toLowerCase();
  return value === "true" || value === "1" || value === "on" || value === "yes";
}

export function readNonNegativeInteger(formData: FormData, key: string, message: string) {
  const value = toStringValue(formData.get(key));

  if (value === "") {
    throw new ValidationError(message);
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ValidationError(message);
  }

  return parsed;
}

export function readOptionalScore(formData: FormData, key: string) {
  const value = toStringValue(formData.get(key));

  if (value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ValidationError("Informe placares inteiros e não negativos.");
  }

  return parsed;
}

const PLATFORM_VALUES: PlayerPlatform[] = ["PS5", "XBOX", "PC"];

export function readPlatform(formData: FormData, key: string) {
  const value = toStringValue(formData.get(key)).toUpperCase();

  if (!value) {
    return null;
  }

  if (!PLATFORM_VALUES.includes(value as PlayerPlatform)) {
    throw new ValidationError("Selecione uma plataforma válida.");
  }

  return value as PlayerPlatform;
}

export function readPositiveLimit(formData: FormData, key: string, message: string) {
  const value = readNonNegativeInteger(formData, key, message);

  if (value <= 0) {
    throw new ValidationError(message);
  }

  return value;
}
