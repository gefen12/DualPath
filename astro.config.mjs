// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The final domain is still an open question; set SITE_URL in the host's
// environment once it is chosen.
const site = process.env.SITE_URL ?? 'https://dualpath.example';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'he'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', he: 'he' } },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        // Astro's own MDX output trips this bundler notice for every lesson.
        // It's harmless and would bury real warnings (like stale reviews).
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('astro:head-inject')) return;
          warn(warning);
        },
      },
    },
  },
});
