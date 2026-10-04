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
- Interface strings live in `src/i18n/ui.ts`. Tax content goes in `/content`, which arrives in Step 2.

## Design tokens

Defined in `src/styles/global.css` (`@theme`) and used as Tailwind classes such as
`bg-navy`, `text-muted`, `border-line`, `bg-ok-bg text-ok`. Green, red and orange are for verdicts only.

## Deploying

CI (`.github/workflows/ci.yml`) runs tests and the build on every push and pull request.
Hosting (Vercel or Netlify) is still an open question. Both detect Astro automatically:
connect the GitHub repo, keep the build command `npm run build` and output `dist`,
and set `SITE_URL` to the final domain so canonical, hreflang and sitemap URLs are correct.
