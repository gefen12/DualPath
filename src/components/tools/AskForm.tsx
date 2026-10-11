import { useId, useState, type SubmitEvent } from 'react';

export interface AskLabels {
  title: string;
  product: string;
  productPlaceholder: string;
  email: string;
  emailHint: string;
  send: string;
  sending: string;
  sent: string;
  error: string;
  notConnected: string;
}

interface Props {
  /** Form service URL, or undefined while it isn't set up yet. */
  endpoint?: string;
  labels: AskLabels;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Sends only the product name and an optional email to the form service. */
export default function AskForm({ endpoint, labels }: Props) {
  const id = useId();
  const [status, setStatus] = useState<Status>('idle');

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint) return;
    const form = event.currentTarget;
    setStatus('sending');
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form
      onSubmit={submit}
      action={endpoint}
      method="post"
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-3 rounded-card border border-line bg-card p-6"
    >
      <h3 id={`${id}-title`} className="m-0 font-sans text-lg font-semibold">
        {labels.title}
      </h3>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-product`} className="text-sm text-muted">
          {labels.product}
        </label>
        <input
          id={`${id}-product`}
          name="product"
          required
          maxLength={200}
          placeholder={labels.productPlaceholder}
          className="min-h-11 rounded-[10px] border border-line-strong px-3 text-base text-navy"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-email`} className="text-sm text-muted">
          {labels.email}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby={`${id}-email-hint`}
          className="min-h-11 rounded-[10px] border border-line-strong px-3 text-base text-navy"
        />
        <p id={`${id}-email-hint`} className="m-0 text-[13px] text-muted">
          {labels.emailHint}
        </p>
      </div>
      <button
        type="submit"
        disabled={!endpoint || status === 'sending'}
        className="min-h-11 cursor-pointer self-start rounded-control border-0 bg-blue px-4.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#8FA6C8]"
      >
        {status === 'sending' ? labels.sending : labels.send}
      </button>
      <p role="status" aria-live="polite" className="m-0 text-sm">
        {!endpoint && <span className="text-depends">{labels.notConnected}</span>}
        {status === 'sent' && <span className="text-ok">{labels.sent}</span>}
        {status === 'error' && <span className="text-avoid">{labels.error}</span>}
      </p>
    </form>
  );
}
