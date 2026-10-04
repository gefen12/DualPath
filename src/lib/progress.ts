import { readStored, writeStored } from './storage';

// Progress is shared by both languages: it's keyed by lesson ref ("investing/israeli-funds-trap").

const COMPLETED_KEY = 'completed';
const checklistKey = (ref: string) => `checklist:${ref}`;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export function getCompletedLessons(): Set<string> {
  return new Set(asStringArray(readStored<unknown>(COMPLETED_KEY, [])));
}

export function markLessonCompleted(ref: string): void {
  const done = getCompletedLessons();
  if (done.has(ref)) return;
  done.add(ref);
  writeStored(COMPLETED_KEY, [...done]);
}

/** Ticked checklist items, by item index. */
export function getChecklistTicks(ref: string, itemCount: number): boolean[] {
  const stored = readStored<unknown>(checklistKey(ref), []);
  const ticks = Array.isArray(stored) ? stored : [];
  return Array.from({ length: itemCount }, (_, i) => ticks[i] === true);
}

export function saveChecklistTicks(ref: string, ticks: boolean[]): void {
  writeStored(checklistKey(ref), ticks);
}
