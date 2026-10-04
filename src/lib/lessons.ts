import type { Lang } from '@/i18n/ui';

/** A lesson is addressed as "<module>/<slug>" in content files and URLs. */
export type LessonRef = `${string}/${string}`;

/** "en/investing/israeli-funds-trap" → { lang: "en", ref: "investing/israeli-funds-trap" } */
export function parseLessonEntryId(entryId: string): { lang: Lang; module: string; slug: string; ref: LessonRef } {
  const [lang, module, slug, ...rest] = entryId.split('/');
  if ((lang !== 'en' && lang !== 'he') || !module || !slug || rest.length) {
    throw new Error(`Lesson file must live at lessons/<en|he>/<module>/<slug>.mdx, got "${entryId}"`);
  }
  return { lang, module, slug, ref: `${module}/${slug}` };
}
