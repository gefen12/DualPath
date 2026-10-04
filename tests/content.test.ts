// Checks the /content folder: every file matches its schema, and every link
// between files (lesson ids, product ids, quiz answers) points at something real.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import {
  deadlineSchema,
  glossarySchema,
  lessonSchema,
  MODULE_IDS,
  moduleSchema,
  productSchema,
  quizSchema,
  siteSchema,
  type LessonFrontmatter,
} from '../src/lib/schemas';
import { parseLessonEntryId } from '../src/lib/lessons';

const root = join(import.meta.dirname, '..', 'content');
const readJson = (name: string): unknown => JSON.parse(readFileSync(join(root, name), 'utf8'));

const site = siteSchema.parse(readJson('site.json'));
const modules = moduleSchema.array().parse(readJson('modules.json'));
const products = productSchema.array().parse(readJson('products.json'));
const glossary = glossarySchema.array().parse(readJson('glossary.json'));
const deadlines = deadlineSchema.array().parse(readJson('deadlines.json'));
const quiz = quizSchema.parse(readJson('quiz.json'));

interface LessonFile {
  path: string;
  lang: 'en' | 'he';
  module: string;
  ref: string;
  data: LessonFrontmatter;
  body: string;
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.mdx') ? [join(dir, e.name)] : [],
  );
}

const lessonsDir = join(root, 'lessons');
const lessons: LessonFile[] = walk(lessonsDir).map((path) => {
  const source = readFileSync(path, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source);
  if (!match) throw new Error(`${path}: missing frontmatter`);
  const result = lessonSchema.safeParse(parseYaml(match[1]!));
  if (!result.success) throw new Error(`${path}: ${result.error.message}`);
  const entryId = relative(lessonsDir, path).replace(/\.mdx$/, '').split(sep).join('/');
  const { lang, module, ref } = parseLessonEntryId(entryId);
  return { path, lang, module, ref, data: result.data, body: match[2]! };
});

const en = lessons.filter((l) => l.lang === 'en');
const he = lessons.filter((l) => l.lang === 'he');
const enByRef = new Map(en.map((l) => [l.ref, l]));

function expectUnique(values: string[], what: string) {
  const dupes = values.filter((v, i) => values.indexOf(v) !== i);
  expect(dupes, `duplicate ${what}`).toEqual([]);
}

describe('JSON content files', () => {
  it('site.json has a name', () => {
    expect(site.name).not.toBe('');
  });

  it('has the 7 modules, numbered 1–7', () => {
    expect(modules.map((m) => m.id).sort()).toEqual([...MODULE_IDS].sort());
    expect(modules.map((m) => m.num).sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('has unique ids', () => {
    expectUnique(products.map((p) => p.id), 'product ids');
    expectUnique(glossary.map((g) => g.id), 'glossary ids');
    expectUnique(deadlines.map((d) => d.id), 'deadline ids');
  });

  it('links products and glossary terms only to lessons that exist', () => {
    const links = [...products, ...glossary].flatMap((e) => (e.lesson ? [[e.id, e.lesson]] : []));
    const broken = links.filter(([, ref]) => !enByRef.has(ref!));
    expect(broken, 'links to missing lessons').toEqual([]);
  });
});

describe('lesson files', () => {
  it('sit in the folder of their module', () => {
    const wrong = lessons.filter((l) => l.module !== l.data.module).map((l) => l.path);
    expect(wrong).toEqual([]);
  });

  it('exist in both English and Hebrew', () => {
    expect(he.map((l) => l.ref).sort()).toEqual(en.map((l) => l.ref).sort());
  });

  it('agree between languages on module, order and title', () => {
    for (const h of he) {
      const e = enByRef.get(h.ref)!;
      expect({ module: h.data.module, order: h.data.order, titleHe: h.data.titleHe }, h.ref).toEqual({
        module: e.data.module,
        order: e.data.order,
        titleHe: e.data.titleHe,
      });
    }
  });

  it('have a unique order inside each module', () => {
    expectUnique(
      en.map((l) => `${l.data.module}#${l.data.order}`),
      'module/order pairs',
    );
  });

  it('include at least one published lesson', () => {
    expect(en.some((l) => l.data.status === 'published')).toBe(true);
  });

  it('use only the lesson components', () => {
    const allowed = new Set(['TermChip', 'Callout', 'VerdictTable', 'Checklist']);
    for (const l of lessons) {
      const used = [...l.body.matchAll(/<([A-Z][A-Za-z]*)/g)].map((m) => m[1]!);
      expect(used.filter((c) => !allowed.has(c)), l.path).toEqual([]);
    }
  });

  it('use only callout types warning and info', () => {
    for (const l of lessons) {
      const types = [...l.body.matchAll(/<Callout\b[^>]*\btype="([^"]*)"/g)].map((m) => m[1]);
      expect(types.filter((t) => t !== 'warning' && t !== 'info'), l.path).toEqual([]);
    }
  });

  it('only put products from products.json in a VerdictTable', () => {
    const productIds = new Set(products.map((p) => p.id));
    for (const l of lessons) {
      for (const [, list] of l.body.matchAll(/<VerdictTable\s+ids=\{\[([^\]]*)\]\}/g)) {
        const ids = [...list!.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
        expect(ids.length, l.path).toBeGreaterThan(0);
        expect(ids.filter((id) => !productIds.has(id)), l.path).toEqual([]);
      }
    }
  });
});

describe('quiz.json', () => {
  it('lists each lesson once, and only lessons that exist with minutes', () => {
    const refs = quiz.path.map((p) => p.lesson);
    expectUnique(refs, 'quiz lessons');
    for (const ref of refs) {
      expect(enByRef.has(ref), `${ref} exists`).toBe(true);
      expect(enByRef.get(ref)?.data.minutes, `${ref} has minutes`).toBeTypeOf('number');
    }
  });

  it('only refers to real questions and answers', () => {
    const answers = new Map(quiz.questions.map((q) => [q.id, new Set(q.answers.map((a) => a.id))]));
    for (const step of quiz.path) {
      for (const [question, picked] of Object.entries(step.when ?? {})) {
        expect(answers.has(question), `${step.lesson}: question "${question}"`).toBe(true);
        for (const a of picked) expect(answers.get(question)!.has(a), `${step.lesson}: answer "${a}"`).toBe(true);
      }
    }
  });
});
