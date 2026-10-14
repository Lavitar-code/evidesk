import { useEffect, useMemo, useState } from "react";
import {
  defaultAppPreferences,
  type AppPreferences,
} from "../types/preferences";

const STORAGE_KEY = "evidesk.preferences";

function readStoredPreferences(): AppPreferences {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return defaultAppPreferences;
    }

    const parsed = JSON.parse(rawValue) as Partial<AppPreferences>;

    return {
      compactMode: parsed.compactMode ?? defaultAppPreferences.compactMode,
      reducedMotion: parsed.reducedMotion ?? defaultAppPreferences.reducedMotion,
      showCommandHint: parsed.showCommandHint ?? defaultAppPreferences.showCommandHint,
      autoOpenDetailPanel:
        parsed.autoOpenDetailPanel ?? defaultAppPreferences.autoOpenDetailPanel,
    };
  } catch {
    return defaultAppPreferences;
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<AppPreferences>(() =>
    readStoredPreferences(),
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("pref-compact", preferences.compactMode);
    root.classList.toggle("pref-reduced-motion", preferences.reducedMotion);
  }, [preferences]);

  const actions = useMemo(
    () => ({
      setCompactMode: (value: boolean) =>
        setPreferences((current) => ({ ...current, compactMode: value })),
      setReducedMotion: (value: boolean) =>
        setPreferences((current) => ({ ...current, reducedMotion: value })),
      setShowCommandHint: (value: boolean) =>
        setPreferences((current) => ({ ...current, showCommandHint: value })),
      setAutoOpenDetailPanel: (value: boolean) =>
        setPreferences((current) => ({ ...current, autoOpenDetailPanel: value })),
      resetPreferences: () => setPreferences(defaultAppPreferences),
    }),
    [],
  );

  return {
    preferences,
    ...actions,
  };
}