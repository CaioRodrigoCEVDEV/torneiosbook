"use client";

import { useEffect, useState } from "react";
import { clearChampionship, getChampionship, saveChampionship } from "@/lib/storage";
import type { Championship } from "@/lib/types";

export function useChampionship() {
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setChampionship(getChampionship());
      setReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const replaceChampionship = (nextChampionship: Championship | null) => {
    setChampionship(nextChampionship);

    if (nextChampionship) {
      saveChampionship(nextChampionship);
      return nextChampionship;
    }

    clearChampionship();
    return null;
  };

  const updateChampionship = (updater: (current: Championship | null) => Championship | null) =>
    setChampionship((current) => {
      const nextChampionship = updater(current);

      if (nextChampionship) {
        saveChampionship(nextChampionship);
      } else {
        clearChampionship();
      }

      return nextChampionship;
    });

  const resetChampionship = () => replaceChampionship(null);

  return {
    championship,
    ready,
    replaceChampionship,
    updateChampionship,
    resetChampionship,
  };
}
