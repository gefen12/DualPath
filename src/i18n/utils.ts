import { defaultLang, languages, ui, type Lang, type UIKey } from './ui';

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in languages;
}

/** Language of a URL path: `/he/...` is Hebrew, everything else English. */
export function getLangFromPath(pathname: string): Lang {
  const [, first] = pathname.split('/');
  return isLang(first) ? first : defaultLang;
}

export function useTranslations(lang: Lang) {
  return (key: UIKey): string => ui[lang][key] ?? ui[defaultLang][key];
}

/** Strip the language prefix: `/he/glossary` → `/glossary`. */
export function stripLang(pathname: string): string {
  const lang = getLangFromPath(pathname);
  if (lang === defaultLang) return pathname || '/';
  const rest = pathname.slice(lang.length + 1);
  return rest === '' ? '/' : rest;
}

/**
 * Path for `lang` from a language-neutral path. English has no prefix.
 * `localizePath('/glossary', 'he')` → `/he/glossary`.
 * Hash and query strings are kept.
 */
export function localizePath(path: string, lang: Lang): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return normalized;
  return `/${lang}${normalized}`;
}

/** The same page in the other language. */
export function switchLangPath(pathname: string, to: Lang): string {
  return localizePath(stripLang(pathname), to);
}
