// The course as pages see it: modules in order, each with its lessons in order,
// joining the English and (optional) Hebrew file of every lesson.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n/ui';
import { parseLessonEntryId, type LessonRef } from './lessons';

type LessonEntry = CollectionEntry<'lessons'>;
type ModuleEntry = CollectionEntry<'modules'>;

export interface CourseLesson {
  ref: LessonRef;
  module: string;
  slug: string;
  /** The English file. Every lesson has one. */
  en: LessonEntry;
  /** The Hebrew file, once it's written. */
  he?: LessonEntry;
}

export interface CourseModule {
  id: string;
  data: ModuleEntry['data'];
  lessons: CourseLesson[];
}

let cache: Promise<CourseModule[]> | undefined;

/** All modules by number, each with its lessons by order. */
export function getCourse(): Promise<CourseModule[]> {
  cache ??= loadCourse();
  return cache;
}

async function loadCourse(): Promise<CourseModule[]> {
  const [modules, entries] = await Promise.all([getCollection('modules'), getCollection('lessons')]);

  const byRef = new Map<string, CourseLesson>();
  for (const entry of entries.filter((e) => parseLessonEntryId(e.id).lang === 'en')) {
    const { ref, module, slug } = parseLessonEntryId(entry.id);
    byRef.set(ref, { ref, module, slug, en: entry });
  }
  for (const entry of entries.filter((e) => parseLessonEntryId(e.id).lang === 'he')) {
    const { ref } = parseLessonEntryId(entry.id);
    const lesson = byRef.get(ref);
    if (!lesson) throw new Error(`Hebrew lesson "${entry.id}" has no English file at lessons/en/${ref}.mdx`);
    lesson.he = entry;
  }

  return modules
    .sort((a, b) => a.data.num - b.data.num)
    .map((m) => ({
      id: m.id,
      data: m.data,
      lessons: [...byRef.values()]
        .filter((l) => l.module === m.id)
        .sort((a, b) => a.en.data.order - b.en.data.order),
    }));
}

/** Every lesson in course order. */
export async function getAllLessons(): Promise<CourseLesson[]> {
  return (await getCourse()).flatMap((m) => m.lessons);
}

/** The file to show in `lang`, or undefined when that language isn't published yet. */
export function publishedEntry(lesson: CourseLesson, lang: Lang): LessonEntry | undefined {
  const entry = lang === 'he' ? lesson.he : lesson.en;
  return entry?.data.status === 'published' ? entry : undefined;
}

/** Published in the other language, but not this one: show a link across. */
export function availableInOtherLanguage(lesson: CourseLesson, lang: Lang): boolean {
  return !publishedEntry(lesson, lang) && !!publishedEntry(lesson, lang === 'he' ? 'en' : 'he');
}

/** Lesson title in the page language, with the other language as the subtitle. */
export function lessonTitles(lesson: CourseLesson, lang: Lang): { title: string; subtitle: string } {
  const { title, titleHe } = (lesson.he ?? lesson.en).data;
  return lang === 'he' ? { title: titleHe, subtitle: title } : { title, subtitle: titleHe };
}

export function moduleTitles(module: CourseModule, lang: Lang): { title: string; subtitle: string; description: string } {
  const d = module.data;
  return lang === 'he'
    ? { title: d.titleHe, subtitle: d.title, description: d.descriptionHe }
    : { title: d.title, subtitle: d.titleHe, description: d.description };
}

/** Previous and next lesson in course order, crossing module boundaries. */
export async function getNeighbours(ref: string): Promise<{ prev?: CourseLesson; next?: CourseLesson }> {
  const all = await getAllLessons();
  const i = all.findIndex((l) => l.ref === ref);
  return { prev: all[i - 1], next: all[i + 1] };
}

export function lessonPath(lesson: Pick<CourseLesson, 'module' | 'slug'>): string {
  return `/learn/${lesson.module}/${lesson.slug}`;
}

export function modulePath(moduleId: string): string {
  return `/learn/${moduleId}`;
}
