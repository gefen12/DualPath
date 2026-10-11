import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { answeredCount, buildPath, sanitizeAnswers } from '../src/lib/quiz';
import { quizSchema } from '../src/lib/schemas';

const quiz = quizSchema.parse(JSON.parse(readFileSync(join(import.meta.dirname, '..', 'content', 'quiz.json'), 'utf8')));

const ALWAYS_FIRST = 'basics/yearly-to-do-list';
const ALWAYS_LAST = ['fbar-fatca/fbar-reporting', 'investing/israeli-funds-trap'];

describe('buildPath (PRD quiz table)', () => {
  it('is empty until all three questions are answered', () => {
    expect(buildPath(quiz, { moved: 'born', filed: 'never' })).toEqual([]);
  });

  it('born here, filed every year, salaried', () => {
    expect(buildPath(quiz, { moved: 'born', filed: 'every-year', work: 'salaried' })).toEqual([
      ALWAYS_FIRST,
      'us-taxes/feie-or-foreign-tax-credit',
      ...ALWAYS_LAST,
    ]);
  });

  it('new oleh who never filed and is self-employed', () => {
    expect(buildPath(quiz, { moved: '2026-or-later', filed: 'never', work: 'self-employed' })).toEqual([
      ALWAYS_FIRST,
      'basics/streamlined-procedure',
      'israeli-taxes/new-olim-2026-reporting',
      'israeli-taxes/self-employed-bituach-leumi',
      ...ALWAYS_LAST,
    ]);
  });

  it('student or soldier who filed some years, moved before 2026', () => {
    expect(buildPath(quiz, { moved: 'before-2026', filed: 'some-years', work: 'student-soldier' })).toEqual([
      ALWAYS_FIRST,
      'basics/streamlined-procedure',
      'us-taxes/first-us-return',
      ...ALWAYS_LAST,
    ]);
  });

  it('lists each lesson once even if rules repeat it', () => {
    const repeated = { ...quiz, path: [...quiz.path, { lesson: ALWAYS_FIRST }] };
    const path = buildPath(repeated, { moved: 'born', filed: 'every-year', work: 'salaried' });
    expect(path.filter((l) => l === ALWAYS_FIRST)).toHaveLength(1);
  });
});

describe('sanitizeAnswers', () => {
  it('drops unknown questions and answers, and junk', () => {
    expect(sanitizeAnswers(quiz, { moved: 'born', filed: 'maybe', other: 'x' })).toEqual({ moved: 'born' });
    expect(sanitizeAnswers(quiz, 'nope')).toEqual({});
    expect(sanitizeAnswers(quiz, null)).toEqual({});
  });

  it('counts answered questions', () => {
    expect(answeredCount(quiz, { moved: 'born', work: 'salaried' })).toBe(2);
  });
});
