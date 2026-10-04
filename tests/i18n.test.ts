import { describe, expect, it } from 'vitest';
import { getLangFromPath, localizePath, stripLang, switchLangPath } from '../src/i18n/utils';

describe('getLangFromPath', () => {
  it('treats /he paths as Hebrew and everything else as English', () => {
    expect(getLangFromPath('/he/')).toBe('he');
    expect(getLangFromPath('/he/glossary')).toBe('he');
    expect(getLangFromPath('/')).toBe('en');
    expect(getLangFromPath('/glossary')).toBe('en');
    expect(getLangFromPath('/hebrew-terms')).toBe('en');
  });
});

describe('localizePath', () => {
  it('leaves English paths unprefixed', () => {
    expect(localizePath('/', 'en')).toBe('/');
    expect(localizePath('/glossary', 'en')).toBe('/glossary');
  });

  it('prefixes Hebrew paths and keeps hashes', () => {
    expect(localizePath('/', 'he')).toBe('/he/');
    expect(localizePath('/glossary', 'he')).toBe('/he/glossary');
    expect(localizePath('/#courses', 'he')).toBe('/he/#courses');
  });
});

describe('switchLangPath', () => {
  it('maps a page to the same page in the other language', () => {
    expect(switchLangPath('/learn/investing/israeli-funds-trap', 'he')).toBe('/he/learn/investing/israeli-funds-trap');
    expect(switchLangPath('/he/learn/investing/israeli-funds-trap', 'en')).toBe('/learn/investing/israeli-funds-trap');
    expect(switchLangPath('/he/', 'en')).toBe('/');
    expect(switchLangPath('/he', 'en')).toBe('/');
    expect(switchLangPath('/', 'he')).toBe('/he/');
    expect(stripLang('/he/deadlines')).toBe('/deadlines');
  });
});
