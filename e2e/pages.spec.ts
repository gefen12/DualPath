// Every key page in both languages: loads, has the right language and direction,
// fits a 360px phone, and passes an automated WCAG 2.2 AA scan.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/learn/investing',
  '/learn/investing/israeli-funds-trap',
  '/learn/basics/yearly-to-do-list',
  '/fund-checker',
  '/glossary',
  '/deadlines',
  '/about',
  '/disclaimer',
  '/sources',
];

for (const lang of ['en', 'he'] as const) {
  for (const path of PAGES) {
    const url = lang === 'he' ? `/he${path}` : path;

    test(`${url} — language, title and no sideways scroll at 360px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      const res = await page.goto(url);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
      await expect(page).toHaveTitle(/DualPath/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang === 'he' ? 'en' : 'he'}"]`)).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test(`${url} — WCAG 2.2 AA (axe)`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary).toEqual([]);
    });
  }
}

test('unknown pages show the bilingual 404 with links to courses and the fund checker', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open the fund checker' })).toHaveAttribute('href', '/fund-checker');
  await expect(page.getByRole('link', { name: 'לבודק ההשקעות' })).toHaveAttribute('href', '/he/fund-checker');
});
