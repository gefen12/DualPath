import type { Product } from '@/lib/schemas';
import { verdictStyles } from '@/lib/verdicts';

/** React twin of VerdictBadge.astro: a word and an icon, never color alone. */
export default function VerdictBadge({ verdict, label }: { verdict: Product['verdict']; label: string }) {
  const style = verdictStyles[verdict];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-semibold ${style.classes}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={style.icon} />
      </svg>
      {label}
    </span>
  );
}
