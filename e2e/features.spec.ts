// The PRD's acceptance checks and the interactive features, in a real browser.
import { expect, test, type Page } from '@playwright/test';

/**
 * Wait until the page's eagerly loaded React islands are interactive (Astro drops
 * `ssr` once an island hydrates). Islands loaded on scroll (client:visible) are skipped.
 */
async function hydrated(page: Page) {
  await page.waitForFunction(() => document.querySelectorAll('astro-island[ssr][client="load"]').length === 0);
}

test('homepage quiz: three answers build a personal path with "Start lesson 1"', async ({ page }) => {
  await page.goto('/');
  await hydrated(page);
  const quiz = page.locator('#quiz');
  const status = quiz.getByRole('status');
  await expect(status).toHaveText('0 of 3 answered');

  await quiz.getByRole('button', { name: '2026 or later', exact: true }).click();
  await quiz.getByRole('button', { name: 'Never', exact: true }).click();
  await expect(status).toHaveText('2 of 3 answered');
  await quiz.getByRole('button', { name: 'Self-employed (Atzmai)', exact: true }).click();

  await expect(status).toHaveText('6 lessons · 48 min');
  await expect(quiz.getByRole('button', { name: 'Never', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(quiz.getByRole('link', { name: 'Start lesson 1' })).toHaveAttribute('href', '/learn/basics/yearly-to-do-list');

  // Saved in the browser, and "Start over" clears it.
  await page.reload();
  await hydrated(page);
  await expect(status).toHaveText('6 lessons · 48 min');
  await quiz.getByRole('button', { name: 'Start over' }).click();
  await expect(status).toHaveText('0 of 3 answered');
});

test('homepage calendar card shows the next four deadlines', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-upcoming] li:not([hidden])')).toHaveCount(4);
});

test('fund checker finds VOO, קרן השתלמות and ta-125', async ({ page }) => {
  await page.goto('/fund-checker');
  await hydrated(page);
  const search = page.getByRole('searchbox');
  const cards = page.locator('main ul h2');
  for (const [query, name] of [
    ['VOO', 'US-listed S&P 500 ETF'],
    ['קרן השתלמות', 'Keren hishtalmut'],
    ['ta-125', 'Fund tracking the TA-125'],
  ]) {
    await search.fill(query);
    await expect(cards).toHaveText([name]);
  }
  await search.fill('dogecoin');
  await expect(page.getByText('Not on our list yet')).toBeVisible();
});

test('fund checker opens with ?q= and filters by verdict', async ({ page }) => {
  await page.goto('/he/fund-checker?q=VOO');
  await hydrated(page);
  await expect(page.getByRole('searchbox')).toHaveValue('VOO');
  await page.getByRole('searchbox').fill('');
  await page.getByRole('button', { name: 'תלוי', exact: true }).click();
  await expect(page.locator('main ul > li')).toHaveCount(3);
});

test('lesson checklist ticks are saved and the lesson is marked finished', async ({ page }) => {
  await page.goto('/learn/investing/israeli-funds-trap');
  await hydrated(page);
  const boxes = page.getByRole('checkbox');
  await boxes.nth(1).check();
  await expect(page.getByText('1 of 4 done')).toBeVisible();
  await page.getByRole('link', { name: /Next:/ }).scrollIntoViewIfNeeded();
  await page.reload();
  await hydrated(page);
  await expect(boxes.nth(1)).toBeChecked();
  await expect(page.locator('aside [data-lesson-ref="investing/israeli-funds-trap"]')).toHaveAttribute('data-done', 'true');
});

test('language switch opens the same page in Hebrew, right to left', async ({ page }) => {
  await page.goto('/glossary');
  await page.getByRole('link', { name: 'עברית' }).click();
  await expect(page).toHaveURL(/\/he\/glossary\/?$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('מילון מונחים');
});

test('deadlines download a calendar file', async ({ page }) => {
  await page.goto('/deadlines');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: /Pay any US tax owed/ }).click()]);
  expect(download.suggestedFilename()).toBe('pay-us-tax.ics');
});

test('the site works with browser storage blocked', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('blocked'); } }));
  await page.goto('/');
  await hydrated(page);
  const quiz = page.locator('#quiz');
  for (const answer of ['I was born here', 'Yes, every year', 'Salaried']) {
    await quiz.getByRole('button', { name: answer, exact: true }).click();
  }
  await expect(quiz.getByRole('status')).toHaveText('4 lessons · 30 min');
  expect(errors).toEqual([]);
});
