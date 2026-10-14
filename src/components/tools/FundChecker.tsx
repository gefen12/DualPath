import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/schemas';
import { matches } from '@/lib/search';
import FilterChips from './FilterChips';
import SearchBox from './SearchBox';
import VerdictBadge from './VerdictBadge';

type Verdict = Product['verdict'];
type Filter = 'all' | Verdict;

export interface CheckerProduct {
  id: string;
  /** Name in the page language, then the other language. */
  name: string;
  otherName: string;
  verdict: Verdict;
  why: string;
  spot: string;
  /** Everything search looks at: both names and the keywords. */
  searchText: string[];
  lessonHref?: string;
}

export interface CheckerLabels {
  searchLabel: string;
  placeholder: string;
  hint: string;
  filterLabel: string;
  all: string;
  verdicts: Record<Verdict, string>;
  count: string;
  countOne: string;
  spot: string;
  noticeTitle: string;
  noticeBody: string;
  readLesson: string;
  emptyTitle: string;
  emptyBody: string;
  askCta: string;
}

interface Props {
  products: CheckerProduct[];
  labels: CheckerLabels;
  otherLang: 'en' | 'he';
}

export default function FundChecker({ products, labels, otherLang }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // A link like /fund-checker?q=VOO opens with that search filled in.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setQuery(q);
  }, []);

  function updateQuery(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  }

  const results = useMemo(
    () => products.filter((p) => (filter === 'all' || p.verdict === filter) && matches(query, p.searchText)),
    [products, query, filter],
  );

  const count = results.length === 1 ? labels.countOne : labels.count.replace('{n}', String(results.length));
  const otherDir = otherLang === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="flex flex-col gap-5">
      <SearchBox label={labels.searchLabel} placeholder={labels.placeholder} hint={labels.hint} value={query} onChange={updateQuery} strong />
      <FilterChips<Filter>
        label={labels.filterLabel}
        value={filter}
        onChange={setFilter}
        count={count}
        options={[
          { value: 'all', label: labels.all },
          { value: 'ok', label: labels.verdicts.ok },
          { value: 'avoid', label: labels.verdicts.avoid },
          { value: 'depends', label: labels.verdicts.depends },
        ]}
      />

      <div
        role="note"
        aria-label={labels.noticeTitle}
        className="flex items-start gap-3.5 rounded-[14px] border-2 border-depends bg-depends-bg px-5 py-4 text-[#6B3307]"
      >
        <svg className="mt-0.5 shrink-0 text-depends" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
        <div className="flex flex-col gap-1">
          <p className="m-0 text-base font-bold text-[#5A2A06]">{labels.noticeTitle}</p>
          <p className="m-0 text-[15px] leading-normal">{labels.noticeBody}</p>
        </div>
      </div>

      {results.length > 0 ? (
        <ul className="m-0 grid list-none gap-3.5 p-0 md:grid-cols-2 xl:grid-cols-3">
          {results.map((p) => (
            <li key={p.id} className="flex flex-col gap-2.5 rounded-card border border-line bg-card px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="m-0 font-sans text-lg leading-snug font-semibold">{p.name}</h2>
                  <p className="text-page-start m-0 mt-0.5 text-[15px] text-muted" lang={otherLang} dir={otherDir}>
                    {p.otherName}
                  </p>
                </div>
                <VerdictBadge verdict={p.verdict} label={labels.verdicts[p.verdict]} />
              </div>
              <p className="m-0 text-[15px] leading-normal text-[#26324A]">{p.why}</p>
              <p className="m-0 rounded-[10px] bg-[#F4F6F9] px-3 py-2.5 text-sm leading-snug text-muted">
                <b className="font-semibold text-[#3E4A5E]">{labels.spot}</b> {p.spot}
              </p>
              {p.lessonHref && (
                <a href={p.lessonHref} className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold">
                  {labels.readLesson}
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line-strong bg-card px-6 py-9 text-center">
          <p className="m-0 text-lg font-semibold">{labels.emptyTitle}</p>
          <p className="m-0 max-w-[520px] text-[15px] leading-normal text-muted">{labels.emptyBody}</p>
          <a
            href="#ask"
            className="mt-1.5 inline-flex min-h-11 items-center rounded-control bg-navy px-4.5 font-semibold text-white no-underline hover:text-white"
          >
            {labels.askCta}
          </a>
        </div>
      )}
    </div>
  );
}
