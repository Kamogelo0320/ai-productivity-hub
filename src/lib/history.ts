import { useEffect, useState, useSyncExternalStore } from "react";

export type FeatureKey = "email" | "meetings" | "tasks" | "research" | "chat";

export type HistoryItem = {
  id: string;
  feature: FeatureKey;
  title: string;
  input: string;
  output: string;
  createdAt: number;
};

const KEY = "synapse.history.v1";
const listeners = new Set<() => void>();

function read(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function addHistory(item: Omit<HistoryItem, "id" | "createdAt">): HistoryItem {
  const entry: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  write([entry, ...read()].slice(0, 200));
  return entry;
}

export function removeHistory(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function clearHistory() {
  write([]);
}

export function useHistory(): HistoryItem[] {
  const items = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(read()),
    () => "[]",
  );
  const [parsed, setParsed] = useState<HistoryItem[]>([]);
  useEffect(() => {
    setParsed(JSON.parse(items) as HistoryItem[]);
  }, [items]);
  return parsed;
}

export function useFeatureCounts(): Record<FeatureKey, number> {
  const history = useHistory();
  const counts: Record<FeatureKey, number> = {
    email: 0,
    meetings: 0,
    tasks: 0,
    research: 0,
    chat: 0,
  };
  for (const h of history) counts[h.feature]++;
  return counts;
}
