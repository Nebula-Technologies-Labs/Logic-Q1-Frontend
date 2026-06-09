import { useState, useCallback } from "react";

interface UserPreferences {
  defaultPage: string;
  itemsPerPage: number;
  dateRange: string;
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyDigest: boolean;
}

const STORAGE_KEY = "user_preferences";

const defaults: UserPreferences = {
  defaultPage: "/",
  itemsPerPage: 5,
  dateRange: "30",
  darkMode: false,
  emailNotifications: true,
  pushNotifications: true,
  dailyDigest: false,
};

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences);

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    setPrefs(defaults);
  }, []);

  return { preferences: prefs, updatePreference, resetPreferences };
}
