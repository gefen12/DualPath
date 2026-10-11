import type { Lang } from '@/i18n/ui';
import { useTranslations } from '@/i18n/utils';
import { nextOccurrence } from './deadlines';
import { buildCalendar } from './ics';
import { isPlaceholder, type Deadline } from './schemas';

/**
 * A calendar file for some deadlines in one language. Hebrew text that is still a
 * placeholder falls back to English, so nobody gets "[HEBREW TEXT]" in their calendar.
 */
export function deadlineCalendar(deadlines: (Deadline & { id: string })[], lang: Lang, now: Date = new Date()): string {
  const t = useTranslations(lang);
  const pick = (en: string, he: string) => (lang === 'he' && !isPlaceholder(he) ? he : en);
  return buildCalendar(
    deadlines.map((d) => ({
      uid: `${d.id}@dualpath`,
      date: nextOccurrence(d, now),
      summary: pick(d.title, d.titleHe),
      description: `${pick(d.note, d.noteHe)}\n\n${t('footer.disclaimer')}`,
    })),
    t('deadlines.calendarName'),
    now,
  );
}

/** Published path of a deadline's .ics file (language-neutral; localize with localizePath). */
export const deadlineIcsPath = (id: string) => `/deadlines/${id}.ics`;
export const allDeadlinesIcsPath = '/deadlines/dualpath-deadlines.ics';
