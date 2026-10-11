import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { matches, normalize } from '../src/lib/search';
import { productSchema } from '../src/lib/schemas';

const products = productSchema
  .array()
  .parse(JSON.parse(readFileSync(join(import.meta.dirname, '..', 'content', 'products.json'), 'utf8')));

const search = (q: string) =>
  products.filter((p) => matches(q, [p.name, p.nameHe, ...p.keywords])).map((p) => p.id);

describe('normalize', () => {
  it('ignores case, spaces, hyphens and gershayim', () => {
    expect(normalize('TA-125')).toBe('ta125');
    expect(normalize('ת״א 125')).toBe('תא125');
    expect(normalize('ת"א 125')).toBe('תא125');
    expect(normalize('תא 125')).toBe('תא125');
    expect(normalize('Keren  Hishtalmut')).toBe('kerenhishtalmut');
  });

  it('drops Hebrew vowel points', () => {
    expect(normalize('קֶרֶן')).toBe('קרן');
  });
});

describe('fund checker search (PRD acceptance)', () => {
  it('finds the US S&P 500 ETF for "VOO"', () => {
    expect(search('VOO')).toEqual(['us-sp500-etf']);
    expect(search('voo')).toEqual(['us-sp500-etf']);
  });

  it('finds keren hishtalmut in Hebrew', () => {
    expect(search('קרן השתלמות')).toEqual(['keren-hishtalmut']);
  });

  it('finds the TA-125 fund however it is typed', () => {
    for (const q of ['ta-125', 'ta125', 'TA 125', 'תא 125', 'ת״א 125', 'ת"א 125']) {
      expect(search(q), q).toContain('ta125-fund');
    }
  });

  it('returns everything for an empty query and nothing for an unknown one', () => {
    expect(search('   ')).toHaveLength(products.length);
    expect(search('dogecoin')).toEqual([]);
  });
});
