// Browser storage for quiz answers, checklist ticks and progress. Storage can be
// blocked (private mode, settings), so every read and write is wrapped and the
// site keeps working without it.
const PREFIX = 'dualpath:';

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage blocked or full */
  }
}

export function removeStored(key: string): void {
  try {
    globalThis.localStorage?.removeItem(PREFIX + key);
  } catch {
    /* storage blocked */
  }
}
