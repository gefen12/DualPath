// Right-to-left safety net: layout must use logical utilities (ms-, pe-, start-,
// text-start…) so Hebrew pages mirror. Physical left/right classes break that.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..', 'src');
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : /\.(astro|tsx|ts)$/.test(e.name) ? [join(dir, e.name)] : [],
  );

// ml-4, mr-auto, pl-2, pr-3, left-0, right-4, text-left, text-right, rounded-l…, border-r…, float-left
const PHYSICAL =
  /(?<![\w-])(?:-?m[lr]-|p[lr]-|-?left-|-?right-|text-(?:left|right)\b|rounded-[lr](?:-|\b)|rounded-[tb][lr]-|border-[lr](?:-|\b)|float-(?:left|right)|scroll-[mp][lr]-)/;

describe('right-to-left layout', () => {
  it('uses logical Tailwind classes only', () => {
    const offenders: string[] = [];
    for (const file of files(root)) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          for (const [, classes] of line.matchAll(/class(?:Name)?=["{`]([^"`}]*)/g)) {
            if (PHYSICAL.test(classes!)) offenders.push(`${relative(root, file)}:${i + 1}: ${classes!.trim()}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});
