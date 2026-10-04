import type { Lang } from '@/i18n/ui';

const locales: Record<Lang, string> = { en: 'en-US', he: 'he-IL' };

/** "Oct 1, 2026" / "1 באוק׳ 2026". Dates are calendar dates, so UTC. */
export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locales[lang], { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}
