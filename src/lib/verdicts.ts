import type { UIKey } from '@/i18n/ui';
import type { Product } from './schemas';

type Verdict = Product['verdict'];

// Verdicts always show a word and an icon, never color alone.
export const verdictStyles: Record<Verdict, { label: UIKey; classes: string; icon: string }> = {
  ok: { label: 'verdict.ok', classes: 'bg-ok-bg text-ok', icon: 'M20 6 9 17l-5-5' },
  avoid: { label: 'verdict.avoid', classes: 'bg-avoid-bg text-avoid', icon: 'M18 6 6 18M6 6l12 12' },
  depends: {
    label: 'verdict.depends',
    classes: 'bg-depends-bg text-depends',
    icon: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  },
};
