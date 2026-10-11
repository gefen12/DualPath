import type { Deadline } from './schemas';

/** Next date (today included) a yearly deadline falls on, as a UTC midnight date. */
export function nextOccurrence(deadline: Pick<Deadline, 'month' | 'day'>, today: Date = new Date()): Date {
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const thisYear = Date.UTC(today.getUTCFullYear(), deadline.month - 1, deadline.day);
  return new Date(thisYear >= start ? thisYear : Date.UTC(today.getUTCFullYear() + 1, deadline.month - 1, deadline.day));
}

/** Deadlines ordered by their next date, soonest first. */
export function upcoming<T extends Pick<Deadline, 'month' | 'day'>>(deadlines: T[], today: Date = new Date()) {
  return deadlines
    .map((d) => ({ deadline: d, date: nextOccurrence(d, today) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Calendar order, January to December. */
export function byCalendar<T extends Pick<Deadline, 'month' | 'day'>>(deadlines: T[]): T[] {
  return [...deadlines].sort((a, b) => a.month - b.month || a.day - b.day);
}
