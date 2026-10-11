interface Props<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  count: string;
}

/** Single-choice filter as real toggle buttons, with a live result count. */
export default function FilterChips<T extends string>({ label, options, value, onChange, count }: Props<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div role="group" aria-label={label} className="flex flex-wrap gap-2.5">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={`min-h-11 cursor-pointer rounded-full border px-4 text-[15px] ${
                on ? 'border-navy bg-navy font-semibold text-white' : 'border-line-strong bg-card font-medium text-navy hover:border-navy'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="m-0 ms-1.5 text-sm text-muted" role="status" aria-live="polite">
        {count}
      </p>
    </div>
  );
}
