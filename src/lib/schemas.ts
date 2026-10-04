// Zod schemas for every file in /content. Astro uses them to validate content
// at build time (src/content.config.ts) and the tests reuse them, so a missing
// field or a bad verdict fails both.
import { z } from 'astro/zod';

export const MODULE_IDS = [
  'basics',
  'us-taxes',
  'fbar-fatca',
  'israeli-taxes',
  'banking',
  'investing',
  'family',
] as const;
export const VERDICTS = ['ok', 'avoid', 'depends'] as const;
export const GLOSSARY_CATEGORIES = ['tax', 'accounts', 'investing', 'family'] as const;

/** A visible placeholder such as "[CPA NAME]", kept until the real value is known. */
export const PLACEHOLDER = /^\[[A-Z ]+\]$/;

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ids are lower-case words joined by hyphens');
const text = z.string().trim().min(1);
const isoDate = z.iso.date();
/** "<module>/<lesson-slug>", e.g. "investing/israeli-funds-trap". */
export const lessonRef = z
  .string()
  .regex(/^[a-z0-9-]+\/[a-z0-9-]+$/, 'lesson links look like "<module>/<lesson-slug>"');

export const siteSchema = z.strictObject({
  name: text,
  reviewer: text,
  reviewerTitle: text,
  lastReviewed: z.union([isoDate, z.string().regex(PLACEHOLDER)]),
  contactEmail: z.union([z.email(), z.string().regex(PLACEHOLDER)]),
});

export const moduleSchema = z.strictObject({
  id: z.enum(MODULE_IDS),
  num: z.number().int().min(1).max(7),
  title: text,
  titleHe: text,
  description: text,
  descriptionHe: text,
});

export const productSchema = z.strictObject({
  id,
  name: text,
  nameHe: text,
  verdict: z.enum(VERDICTS),
  why: text,
  whyHe: text,
  spot: text,
  spotHe: text,
  keywords: z.array(text).min(1),
  lesson: lessonRef.optional(),
});

export const glossarySchema = z.strictObject({
  id,
  en: text,
  he: text,
  category: z.enum(GLOSSARY_CATEGORIES),
  definition: text,
  definitionHe: text,
  lesson: lessonRef.optional(),
});

export const deadlineSchema = z
  .strictObject({
    id,
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
    title: text,
    titleHe: text,
    note: text,
    noteHe: text,
  })
  .refine((d) => d.day <= new Date(Date.UTC(2001, d.month, 0)).getUTCDate(), {
    message: 'day does not exist in that month',
    path: ['day'],
  });

const answerSchema = z.strictObject({ id, label: text, labelHe: text });

export const quizSchema = z.strictObject({
  questions: z
    .array(
      z.strictObject({
        id,
        label: text,
        labelHe: text,
        answers: z.array(answerSchema).min(2),
      }),
    )
    .min(1),
  /**
   * Lessons in path order. `when` maps question ids to the answers that
   * include the lesson; every listed question must match. No `when` = always.
   */
  path: z
    .array(
      z.strictObject({
        lesson: lessonRef,
        when: z.record(z.string(), z.array(z.string()).min(1)).optional(),
      }),
    )
    .min(1),
});

const sourceSchema = z.strictObject({ title: text, url: z.url() });

/**
 * Lesson frontmatter. Published lessons need every field; "coming-soon" stubs
 * only need what the module page shows (title, Hebrew title, module, order).
 */
export const lessonSchema = z
  .strictObject({
    title: text,
    titleHe: text,
    module: z.enum(MODULE_IDS),
    order: z.number().int().min(1),
    status: z.enum(['published', 'coming-soon']),
    minutes: z.number().int().min(1).max(60).optional(),
    summary: text.optional(),
    lastReviewed: z.coerce.date().optional(),
    reviewer: text.optional(),
    sources: z.array(sourceSchema).optional(),
  })
  .superRefine((lesson, ctx) => {
    if (lesson.status !== 'published') return;
    for (const field of ['minutes', 'summary', 'lastReviewed', 'reviewer'] as const) {
      if (lesson[field] === undefined) {
        ctx.addIssue({ code: 'custom', path: [field], message: `${field} is required for published lessons` });
      }
    }
    if (!lesson.sources?.length) {
      ctx.addIssue({ code: 'custom', path: ['sources'], message: 'published lessons need at least one source' });
    }
  });

export type Site = z.infer<typeof siteSchema>;
export type Module = z.infer<typeof moduleSchema>;
export type Product = z.infer<typeof productSchema>;
export type GlossaryEntry = z.infer<typeof glossarySchema>;
export type Deadline = z.infer<typeof deadlineSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type LessonFrontmatter = z.infer<typeof lessonSchema>;
