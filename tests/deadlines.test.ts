import { describe, expect, it } from 'vitest';
import { byCalendar, nextOccurrence, upcoming } from '../src/lib/deadlines';
import { buildCalendar, escapeText, foldLine } from '../src/lib/ics';

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe('nextOccurrence', () => {
  it('uses this year when the date is today or later', () => {
    expect(iso(nextOccurrence({ month: 10, day: 15 }, new Date('2026-10-11T22:00:00Z')))).toBe('2026-10-15');
    expect(iso(nextOccurrence({ month: 10, day: 15 }, new Date('2026-10-15T08:00:00Z')))).toBe('2026-10-15');
  });

  it('rolls to next year once the date has passed', () => {
    expect(iso(nextOccurrence({ month: 4, day: 15 }, new Date('2026-10-11T00:00:00Z')))).toBe('2027-04-15');
  });

  it('orders by next date and by calendar', () => {
    const list = [
      { id: 'apr', month: 4, day: 15 },
      { id: 'dec', month: 12, day: 31 },
      { id: 'oct', month: 10, day: 15 },
    ];
    expect(upcoming(list, new Date('2026-10-11')).map((u) => u.deadline.id)).toEqual(['oct', 'dec', 'apr']);
    expect(byCalendar(list).map((d) => d.id)).toEqual(['apr', 'oct', 'dec']);
  });
});

describe('ics', () => {
  it('escapes special characters', () => {
    expect(escapeText('a, b; c\\d\ne')).toBe('a\\, b\; c\\\\d\\ne');
  });

  it('folds long lines at 75 bytes without splitting Hebrew letters', () => {
    const line = 'SUMMARY:' + 'מ'.repeat(60);
    const folded = foldLine(line).split('\r\n ');
    expect(folded.length).toBeGreaterThan(1);
    for (const part of folded) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    expect(folded.join('')).toBe(line);
  });

  it('builds a yearly all-day event', () => {
    const ics = buildCalendar(
      [{ uid: 'fbar@dualpath', date: new Date(Date.UTC(2026, 9, 15)), summary: 'FBAR, extended', description: 'Note' }],
      'DualPath',
      new Date(Date.UTC(2026, 9, 11, 12, 0, 0)),
    );
    expect(ics).toContain('DTSTART;VALUE=DATE:20261015\r\n');
    expect(ics).toContain('DTEND;VALUE=DATE:20261016\r\n');
    expect(ics).toContain('RRULE:FREQ=YEARLY\r\n');
    expect(ics).toContain('SUMMARY:FBAR\\, extended\r\n');
    expect(ics).toContain('DTSTAMP:20261011T120000Z\r\n');
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});
