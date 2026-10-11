import { useMemo, useState } from 'react';
import type { GlossaryEntry } from '@/lib/schemas';
import { matches } from '@/lib/search';
import FilterChips from './FilterChips';
import SearchBox from './SearchBox';

type Category = GlossaryEntry['category'];
type Filter = 'all' | Category;

export interface GlossaryRow {
  id: string;
  /** Term in the page language, then the other language. */
  term: string;
  otherTerm: string;
  definition: string;
  category: Category;
  lessonHref?: string;
}

export interface GlossaryLabels {
  searchLabel: string;
  placeholder: string;
  hint: string;
  filterLabel: string;
  all: string;
  categories: Record<Category, string>;
  count: string;
  countOne: string;
  empty: string;
  lesson: string;
}

interface Props {
  rows: GlossaryRow[];
  labels: GlossaryLabels;
  otherLang: 'en' | 'he';
}

export default function Glossary({ rows, labels, otherLang }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // Terms that match by name come before terms that only match in their definition.
  const results = useMemo(() => {
    const inCategory = rows.filter((r) => filter === 'all' || r.category === filter);
    const byTerm = inCategory.filter((r) => matches(query, [r.term, r.otherTerm]));
    const byDefinition = inCategory.filter((r) => !byTerm.includes(r) && matches(query, [r.definition]));
    return [...byTerm, ...byDefinition];
  }, [rows, query, filter]);

  const count = results.length === 1 ? labels.countOne : labels.count.replace('{n}', String(results.length));
  const otherDir = otherLang === 'he' ? 'rtl' : 'ltr';
  const categories = Object.keys(labels.categories) as Category[];

  return (
    <div className="flex flex-col gap-5">
      <SearchBox label={labels.searchLabel} placeholder={labels.placeholder} hint={labels.hint} value={query} onChange={setQuery} />
      <FilterChips<Filter>
        label={labels.filterLabel}
        value={filter}
        onChange={setFilter}
        count={count}
        options={[{ value: 'all', label: labels.all }, ...categories.map((c) => ({ value: c, label: labels.categories[c] }))]}
      />

      <div className="overflow-hidden rounded-card border border-line bg-card">
        {results.length > 0 ? (
          <dl className="m-0">
            {results.map((r) => (
              <div
                key={r.id}
                className="grid gap-x-6 gap-y-2 border-b border-[#EEF1F5] px-5 py-4.5 last:border-b-0 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_150px] md:items-start"
              >
                <dt className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">{r.term}</span>
                  <span className="text-page-start text-lg font-bold text-blue" lang={otherLang} dir={otherDir}>
                    {r.otherTerm}
                  </span>
                </dt>
                <dd className="m-0 flex flex-col gap-1.5 text-base leading-relaxed text-[#26324A]">
                  <span>{r.definition}</span>
                  {r.lessonHref && (
                    <a href={r.lessonHref} className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold">
                      {labels.lesson}
                    </a>
                  )}
                </dd>
                <dd className="m-0 md:text-end">
                  <span className="inline-block rounded-full bg-[#F0F3F7] px-2.5 py-1 text-[13px] font-medium text-[#3E4A5E]">
                    {labels.categories[r.category]}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="m-0 px-6 py-9 text-center text-muted">{labels.empty}</p>
        )}
      </div>
    </div>
  );
}
