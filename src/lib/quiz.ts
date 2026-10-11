import type { Quiz } from './schemas';

/** Picked answer id per question id. */
export type Answers = Record<string, string>;

/** Keep only answers that exist in the quiz (stored answers may be stale or tampered with). */
export function sanitizeAnswers(quiz: Quiz, raw: unknown): Answers {
  if (!raw || typeof raw !== 'object') return {};
  const answers: Answers = {};
  for (const q of quiz.questions) {
    const value = (raw as Record<string, unknown>)[q.id];
    if (typeof value === 'string' && q.answers.some((a) => a.id === value)) answers[q.id] = value;
  }
  return answers;
}

export function answeredCount(quiz: Quiz, answers: Answers): number {
  return quiz.questions.filter((q) => q.answers.some((a) => a.id === answers[q.id])).length;
}

export function isComplete(quiz: Quiz, answers: Answers): boolean {
  return answeredCount(quiz, answers) === quiz.questions.length;
}

/**
 * Lesson refs for these answers, in quiz.json order, each once. A step without
 * `when` is always included; otherwise every listed question must match.
 * Empty until every question is answered.
 */
export function buildPath(quiz: Quiz, answers: Answers): string[] {
  if (!isComplete(quiz, answers)) return [];
  const seen = new Set<string>();
  const path: string[] = [];
  for (const step of quiz.path) {
    const included = Object.entries(step.when ?? {}).every(([question, allowed]) => allowed.includes(answers[question] ?? ''));
    if (included && !seen.has(step.lesson)) {
      seen.add(step.lesson);
      path.push(step.lesson);
    }
  }
  return path;
}
