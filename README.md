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
| `npm test`        | Unit tests (Vitest)                             |

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
- The build warns when a published lesson's `lastReviewed` is more than 12 months old.
- Placeholders such as `[CPA NAME]`, `[DATE]` and `[HEBREW TEXT]` stay visible on the
  site until someone fills them in. `grep -rn "\[HEBREW TEXT\]" content` lists the
  Hebrew text still to write.

## Design tokens

Defined in `src/styles/global.css` (`@theme`) and used as Tailwind classes such as
`bg-navy`, `text-muted`, `border-line`, `bg-ok-bg text-ok`. Green, red and orange are for verdicts only.

## Deploying

CI (`.github/workflows/ci.yml`) runs tests and the build on every push and pull request.
Hosting (Vercel or Netlify) is still an open question. Both detect Astro automatically:
connect the GitHub repo, keep the build command `npm run build` and output `dist`,
and set `SITE_URL` to the final domain so canonical, hreflang and sitemap URLs are correct.
