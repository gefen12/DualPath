// Renders the Open Graph share images (public/og/en.png, public/og/he.png) with
// Playwright. Run after changing the site name or headline: `npm run og`.
// Set CHROMIUM_PATH to use a preinstalled Chromium instead of Playwright's own.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const site = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const variants = {
  en: { dir: 'ltr', eyebrow: 'Free course · English & עברית', title: 'For Americans living in Israel: what to do with your money.' },
  he: { dir: 'rtl', eyebrow: 'קורס חינמי · עברית ו־English', title: 'אמריקאים שגרים בישראל: מה לעשות עם הכסף.' },
};

const html = (lang, v) => `<!doctype html><html lang="${lang}" dir="${v.dir}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Heebo:wght@500;800&family=IBM+Plex+Sans:wght@500&display=swap" rel="stylesheet">
<style>
  body { margin: 0; width: 1200px; height: 630px; background: #13233F; color: #fff; font-family: ${lang === 'he' ? "'Heebo'" : "'IBM Plex Sans'"}, system-ui, sans-serif; }
  .wrap { box-sizing: border-box; height: 100%; padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 16px; font-family: 'Bricolage Grotesque', 'Heebo', sans-serif; font-weight: 800; font-size: 40px; }
  .mark { width: 64px; height: 64px; border-radius: 16px; background: #fff; display: flex; align-items: center; justify-content: center; }
  .eyebrow { display: inline-block; font-size: 24px; font-weight: 500; color: #9CC0F5; margin-bottom: 20px; }
  h1 { margin: 0; font-family: 'Bricolage Grotesque', 'Heebo', sans-serif; font-weight: 800; font-size: 68px; line-height: 1.08; max-width: 980px; }
  .bar { height: 10px; width: 180px; border-radius: 99px; background: #1F5FBF; }
</style></head><body><div class="wrap">
  <div class="logo" dir="ltr"><span class="mark"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#13233F" stroke-width="2" stroke-linecap="round"><path d="M4 12h6M14 12h6M4 6h16M4 18h16"/><circle cx="12" cy="12" r="2.5"/></svg></span>${site.name}</div>
  <div><span class="eyebrow">${v.eyebrow}</span><h1>${v.title}</h1></div>
  <div class="bar"></div>
</div></body></html>`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [lang, v] of Object.entries(variants)) {
  await page.setContent(html(lang, v), { waitUntil: 'networkidle' }).catch(() => {});
  await page.screenshot({ path: `public/og/${lang}.png` });
  console.log(`public/og/${lang}.png`);
}
await browser.close();
