import { useId } from 'react';

interface Props {
  label: string;
  placeholder: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  strong?: boolean;
}

/** Search field with a visible-on-focus label for screen readers and a search icon. */
export default function SearchBox({ label, placeholder, hint, value, onChange, strong = false }: Props) {
  const id = useId();
  return (
    <div className="flex max-w-[680px] flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div
        className={`flex min-h-14 items-center gap-3 rounded-[14px] bg-card px-4 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-blue ${
          strong ? 'border-2 border-navy' : 'border border-line-strong'
        }`}
      >
        <svg className="shrink-0 text-navy" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={`${id}-hint`}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 border-0 bg-transparent py-3 text-lg text-navy outline-none placeholder:text-muted"
        />
      </div>
      <p id={`${id}-hint`} className="sr-only">
        {hint}
      </p>
    </div>
  );
}
