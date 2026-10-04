import { describe, expect, it } from 'vitest';
import { isReviewStale } from '../src/lib/freshness';
import { deadlineSchema, lessonSchema, productSchema } from '../src/lib/schemas';

const product = {
  id: 'us-sp500-etf',
  name: 'US-listed S&P 500 ETF',
  nameHe: 'קרן סל אמריקאית על S&P 500',
  verdict: 'ok',
  why: 'x',
  whyHe: 'x',
  spot: 'x',
  spotHe: 'x',
  keywords: ['VOO'],
};

describe('productSchema', () => {
  it('rejects an unknown verdict', () => {
    expect(productSchema.safeParse(product).success).toBe(true);
    expect(productSchema.safeParse({ ...product, verdict: 'maybe' }).success).toBe(false);
  });

  it('rejects unknown fields and missing fields', () => {
    expect(productSchema.safeParse({ ...product, extra: 1 }).success).toBe(false);
    const { why: _, ...missing } = product;
    expect(productSchema.safeParse(missing).success).toBe(false);
  });
});

describe('deadlineSchema', () => {
  it('rejects a day that is not in the month', () => {
    const d = { id: 'x', month: 4, day: 30, title: 'x', titleHe: 'x', note: 'x', noteHe: 'x' };
    expect(deadlineSchema.safeParse(d).success).toBe(true);
    expect(deadlineSchema.safeParse({ ...d, day: 31 }).success).toBe(false);
  });
});

describe('lessonSchema', () => {
  const stub = { title: 'x', titleHe: 'x', module: 'investing', order: 1, status: 'coming-soon' };

  it('accepts a coming-soon stub with only the basics', () => {
    expect(lessonSchema.safeParse(stub).success).toBe(true);
  });

  it('requires every field once a lesson is published', () => {
    const result = lessonSchema.safeParse({ ...stub, status: 'published' });
    expect(result.success).toBe(false);
    const paths = result.error!.issues.map((i) => i.path.join('.')).sort();
    expect(paths).toEqual(['lastReviewed', 'minutes', 'reviewer', 'sources', 'summary']);
  });

  it('rejects an unknown module', () => {
    expect(lessonSchema.safeParse({ ...stub, module: 'crypto' }).success).toBe(false);
  });
});

describe('isReviewStale', () => {
  const reviewed = new Date('2026-10-01');

  it('is fresh up to 12 months after review', () => {
    expect(isReviewStale(reviewed, new Date('2027-09-30'))).toBe(false);
    expect(isReviewStale(reviewed, new Date('2027-10-01'))).toBe(false);
  });

  it('is stale after 12 months', () => {
    expect(isReviewStale(reviewed, new Date('2027-10-02'))).toBe(true);
  });
});
