import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { isReviewStale, REVIEW_MAX_MONTHS } from '@/lib/freshness';
import { deadlineSchema, glossarySchema, lessonSchema, moduleSchema, productSchema } from '@/lib/schemas';

// Content lives in /content at the repo root, separate from code.

const lessons = defineCollection({
  // Entry ids look like "en/investing/israeli-funds-trap".
  loader: glob({ pattern: '**/*.mdx', base: './content/lessons' }),
  schema: lessonSchema.superRefine((lesson) => {
    if (lesson.status === 'published' && lesson.lastReviewed && isReviewStale(lesson.lastReviewed)) {
      console.warn(
        `[content] "${lesson.title}" was last reviewed ${lesson.lastReviewed.toISOString().slice(0, 10)}, more than ${REVIEW_MAX_MONTHS} months ago.`,
      );
    }
  }),
});

const modules = defineCollection({ loader: file('content/modules.json'), schema: moduleSchema });
const products = defineCollection({ loader: file('content/products.json'), schema: productSchema });
const glossary = defineCollection({ loader: file('content/glossary.json'), schema: glossarySchema });
const deadlines = defineCollection({ loader: file('content/deadlines.json'), schema: deadlineSchema });

export const collections = { lessons, modules, products, glossary, deadlines };
