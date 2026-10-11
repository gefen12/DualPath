# DualPath

A free, bilingual (English/Hebrew) learning site for Americans living in Israel:
US and Israeli taxes, bank accounts and investing. "DualPath" is a working name.

Built with Astro + TypeScript, React islands, Tailwind CSS and MDX. It's a static site with no server and no database.

## Commands

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm install`     | Install dependencies (Node 22.12+)              |
| `npm run dev`     | Local dev server at http://localhost:4321       |
| `npm run build`   | Type-check (`astro check`) and build to `dist/` |
| `npm run preview` | Serve the built site                            |
| `npm test`        | Unit, content and RTL tests (Vitest)            |
| `npm run test:e2e`| Browser tests on the built site (Playwright + axe accessibility scan) |
| `npm run og`      | Regenerate the share images in `public/og/`     |

## Languages

- English lives at `/`, Hebrew at `/he/`. Every page has a matching page in the other language.
- Hebrew pages render with `lang="he" dir="rtl"`. Use Tailwind's logical utilities
  (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`) and never `ml-`/`mr-`/`left-`/`right-`.
- Interface strings live in `src/i18n/ui.ts`. Tax content lives in `/content`, never in code.

## Content

Everything a reviewer edits is in `/content`:

```
content/
  site.json          site name, reviewer, last-reviewed date, contact email
  modules.json       the 7 modules
  lessons/en/<module>/<lesson>.mdx
  lessons/he/<module>/<lesson>.mdx
  products.json      fund checker
  glossary.json
  deadlines.json     recurring yearly dates (month + day)
  quiz.json          questions and the rules that build a learning path
```

- Schemas are in `src/lib/schemas.ts`. A missing field, an unknown verdict or a bad
  date fails the build, and so does a broken link between files: `tests/content.test.ts`
  runs as part of `npm run build`.
- **Adding a lesson:** create one file, `lessons/en/<module>/<slug>.mdx`. Its English and
  Hebrew pages (`/learn/<module>/<slug>`, `/he/learn/<module>/<slug>`) appear on the next build.
  Add the Hebrew translation later at the same path under `lessons/he/`; until then the Hebrew
  page links to the English lesson. Start with `status: coming-soon` (only `title`, `titleHe`, `module`
  and `order` are needed). A `published` lesson also needs `minutes`, `summary`,
  `lastReviewed`, `reviewer` and at least one source.
- Lessons and other files link to a lesson as `"<module>/<slug>"`, e.g. `"investing/israeli-funds-trap"`.
- In lesson bodies you can use `<TermChip he en>`, `<Callout type="warning|info">`,
  `<VerdictTable ids={[...product ids]}>` and `<Checklist items={[...]}>`.
- Checklist ticks and finished lessons (a lesson counts as finished once the reader reaches
  its end) are saved in the browser only, under `dualpath:*` keys.
- **Fund checker search** ignores case, spaces, hyphens, gershayim and quotes, and also
  looks at each product's `keywords` (`src/lib/search.ts`). Add spellings people type
  (tickers, transliterations, Hebrew with and without ״) as keywords.
- **Deadlines** are month + day and repeat yearly. Each one gets an `.ics` file
  (`/deadlines/<id>.ics`, plus `/deadlines/dualpath-deadlines.ics` for all of them) with a
  yearly repeat rule. Hebrew calendar files fall back to English while the Hebrew text is a placeholder.
- **Quiz:** `quiz.json` lists the questions and the path. Each path step names a lesson
  and, optionally, `when`: the answers that include it (`{"work": ["salaried"]}`); a step
  without `when` is always shown. Steps keep their order and each lesson appears once.
  Answers are saved in the browser.
- **Homepage Allowed vs Avoid** lists come straight from `products.json` verdicts.
- **Ask form:** set `askFormEndpoint` in `site.json` to a form service URL (e.g. Formspree).
  Until then the form shows that it isn't connected and points to the contact email.
- **About and Disclaimer** live in `content/pages/<lang>/`. The Hebrew pages show the
  English text with a note until `content/pages/he/about.mdx` / `disclaimer.mdx` exist.
- **Sources page** is built from the `sources` of every published lesson, grouped by each
  source's `country` (`us` or `il`).
- **Analytics:** set `analyticsDomain` in `site.json` to the domain registered with
  [Plausible](https://plausible.io) (cookie-free). While it's a placeholder, no analytics load.
- **CPA review:** lessons default to `cpaReviewed: false`, which shows a "Draft — not yet
  reviewed by a CPA" banner and treats `lastReviewed` as "sources checked". When a CPA signs off,
  set `cpaReviewed: true`, `reviewer` and `lastReviewed`. See `docs/content-review.md`.
- The build warns when a published lesson's `lastReviewed` is more than 12 months old.
- Placeholders such as `[CPA NAME]`, `[DATE]` and `[HEBREW TEXT]` stay visible on the
  site until someone fills them in. `grep -rn "\[HEBREW TEXT\]" content` lists the
  Hebrew text still to write.

## Design tokens

Defined in `src/styles/global.css` (`@theme`) and used as Tailwind classes such as
`bg-navy`, `text-muted`, `border-line`, `bg-ok-bg text-ok`. Green, red and orange are for verdicts only.

## Tests

- `npm test`: schemas and cross-file links in `/content`, search, quiz rules, deadlines and
  `.ics` files, browser storage, and a check that layout code only uses RTL-safe classes.
- `npm run test:e2e` (after `npm run build`): every key page in English and Hebrew loads with
  the right language and direction, fits a 360px phone and passes an axe WCAG 2.2 AA scan,
  plus the PRD acceptance checks (quiz path, fund checker searches, checklist, calendar files).
  Set `CHROMIUM_PATH` to use an already installed Chromium.

## Deploying

CI (`.github/workflows/ci.yml`) builds and runs both test suites on every push and pull request.
Hosting (Vercel or Netlify) is still an open question. Both detect Astro automatically:
connect the GitHub repo, keep the build command `npm run build` and output `dist`,
and set `SITE_URL` to the final domain so canonical, hreflang and sitemap URLs are correct.
