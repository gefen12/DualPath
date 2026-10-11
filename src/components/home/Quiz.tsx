import { useEffect, useId, useState } from 'react';
import { answeredCount, buildPath, isComplete, sanitizeAnswers, type Answers } from '@/lib/quiz';
import type { Quiz as QuizData } from '@/lib/schemas';
import { readStored, removeStored, writeStored } from '@/lib/storage';

const STORAGE_KEY = 'quiz';

export interface QuizLesson {
  title: string;
  minutes: number;
  href: string;
}

export interface QuizLabels {
  pathTitle: string;
  /** "{n} of {total} answered" */
  progress: string;
  /** "{n} lessons · {m} min" */
  summary: string;
  minutes: string;
  empty: string;
  start: string;
  reset: string;
}

interface Props {
  /** Questions and answers already in the page language; ids match quiz.json. */
  quiz: QuizData;
  labels: QuizLabels;
  lessons: Record<string, QuizLesson>;
}

const fillIn = (template: string, values: Record<string, number>) =>
  template.replace(/\{(\w+)\}/g, (slot, name: string) => String(values[name] ?? slot));

export default function Quiz({ quiz, labels, lessons }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const idPrefix = useId();

  // Saved answers are read after hydration so the server HTML is the same for everyone.
  useEffect(() => {
    setAnswers(sanitizeAnswers(quiz, readStored<unknown>(STORAGE_KEY, {})));
  }, [quiz]);

  function pick(questionId: string, answerId: string) {
    const next = { ...answers, [questionId]: answerId };
    setAnswers(next);
    writeStored(STORAGE_KEY, next);
  }

  function reset() {
    setAnswers({});
    removeStored(STORAGE_KEY);
    document.getElementById(`${idPrefix}-q0`)?.focus();
  }

  const done = isComplete(quiz, answers);
  const path = buildPath(quiz, answers).flatMap((ref) => (lessons[ref] ? [{ ref, ...lessons[ref] }] : []));
  const totalMinutes = path.reduce((sum, l) => sum + l.minutes, 0);
  const meta = done
    ? fillIn(labels.summary, { n: path.length, m: totalMinutes })
    : fillIn(labels.progress, { n: answeredCount(quiz, answers), total: quiz.questions.length });

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col gap-7">
        {quiz.questions.map((q, qi) => (
          <fieldset key={q.id} className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend className="mb-3 p-0 text-[17px] font-semibold">
              {qi + 1}. {q.label}
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {q.answers.map((a, ai) => {
                const on = answers[q.id] === a.id;
                return (
                  <button
                    key={a.id}
                    id={ai === 0 ? `${idPrefix}-q${qi}` : undefined}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(q.id, a.id)}
                    className={`min-h-11 cursor-pointer rounded-full border px-4.5 text-[15px] focus-visible:outline-white ${
                      on
                        ? 'border-white bg-white font-semibold text-navy'
                        : 'border-[#5B6B86] bg-transparent font-medium text-white hover:border-white'
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <section
        aria-labelledby={`${idPrefix}-path`}
        className="flex flex-col gap-4 self-start rounded-card bg-card p-6 text-navy sm:p-7"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 id={`${idPrefix}-path`} className="m-0 text-2xl">
            {labels.pathTitle}
          </h3>
          <p className="m-0 text-sm text-muted" role="status" aria-live="polite">
            {meta}
          </p>
        </div>

        {done ? (
          <>
            <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
              {path.map((lesson, i) => (
                <li key={lesson.ref}>
                  <a
                    href={lesson.href}
                    className="grid min-h-11 grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-control border border-line px-3.5 py-3 text-navy no-underline hover:border-blue hover:text-navy"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-blue-tint text-sm font-semibold text-blue">
                      {i + 1}
                    </span>
                    <span className="font-medium">{lesson.title}</span>
                    <span className="text-[13px] whitespace-nowrap text-muted">
                      {fillIn(labels.minutes, { n: lesson.minutes })}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            {path[0] && (
              <a
                href={path[0].href}
                className="inline-flex min-h-12 items-center justify-center rounded-control bg-blue px-5 font-semibold text-white no-underline hover:bg-blue-dark hover:text-white"
              >
                {labels.start}
              </a>
            )}
          </>
        ) : (
          <p className="m-0 rounded-control border border-dashed border-line-strong px-5 py-8 text-center leading-normal text-muted">
            {labels.empty}
          </p>
        )}

        {answeredCount(quiz, answers) > 0 && (
          <button
            type="button"
            onClick={reset}
            className="min-h-11 cursor-pointer self-start border-0 bg-transparent p-0 text-[15px] font-semibold text-blue underline underline-offset-2 hover:text-blue-dark"
          >
            {labels.reset}
          </button>
        )}
      </section>
    </div>
  );
}
