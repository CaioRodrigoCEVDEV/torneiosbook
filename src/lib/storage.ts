import { STORAGE_KEY } from "./constants";
import type { Championship } from "./types";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getChampionship(): Championship | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as Championship;
  } catch {
    return null;
  }
}

export function saveChampionship(championship: Championship) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(championship));
}

export function clearChampionship() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function hasChampionship() {
  if (!canUseStorage()) {
    return false;
  }

  return Boolean(window.localStorage.getItem(STORAGE_KEY));
}
