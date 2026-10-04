import { useEffect, useId, useState } from 'react';
import { getChecklistTicks, saveChecklistTicks } from '@/lib/progress';

interface Props {
  items: string[];
  lessonRef: string;
  title: string;
  /** e.g. "{done} of {total} done" */
  progressTemplate: string;
}

export default function ChecklistIsland({ items, lessonRef, title, progressTemplate }: Props) {
  const headingId = useId();
  const [ticks, setTicks] = useState<boolean[]>(() => items.map(() => false));

  // Saved ticks are read after hydration so the server HTML stays the same for everyone.
  useEffect(() => {
    setTicks(getChecklistTicks(lessonRef, items.length));
  }, [lessonRef, items.length]);

  function toggle(index: number) {
    const next = ticks.map((ticked, i) => (i === index ? !ticked : ticked));
    setTicks(next);
    saveChecklistTicks(lessonRef, next);
  }

  const done = ticks.filter(Boolean).length;
  const progress = progressTemplate.replace('{done}', String(done)).replace('{total}', String(items.length));

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3 rounded-card border border-line bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={headingId} className="m-0 text-[22px] text-navy">
          {title}
        </h2>
        <p className="m-0 text-sm text-muted" aria-live="polite">
          {progress}
        </p>
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {items.map((item, i) => (
          <li key={i}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 py-1 text-base leading-snug text-navy">
              <input
                type="checkbox"
                checked={ticks[i] ?? false}
                onChange={() => toggle(i)}
                className="size-5 shrink-0 cursor-pointer accent-blue"
              />
              <span className={ticks[i] ? 'text-muted line-through' : undefined}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
