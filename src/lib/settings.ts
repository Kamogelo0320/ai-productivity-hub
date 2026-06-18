import { useEffect, useState } from "react";

export type Settings = {
  theme: "dark" | "light";
  responseStyle: "concise" | "balanced" | "detailed";
  notifications: boolean;
  privacyMode: boolean;
};

const KEY = "synapse.settings.v1";

const defaults: Settings = {
  theme: "dark",
  responseStyle: "balanced",
  notifications: true,
  privacyMode: false,
};

function read(): Settings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return defaults;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaults);

  useEffect(() => {
    setSettings(read());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    if (settings.theme === "light") {
      html.classList.remove("dark");
      html.classList.add("light");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
    }
  }, [settings.theme]);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  return { settings, update };
}
