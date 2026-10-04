export const languages = {
  en: 'English',
  he: 'עברית',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

export const dirs: Record<Lang, 'ltr' | 'rtl'> = {
  en: 'ltr',
  he: 'rtl',
};

// Interface strings only. Tax content lives in /content, never here.
// Hebrew strings still need review by the Hebrew translator (open question).
export const ui = {
  en: {
    'site.name': 'DualPath',
    'site.tagline': 'כסף ומיסים לאמריקאים בישראל',
    'site.taglineLang': 'he',
    'site.description':
      'Free lessons for Americans living in Israel: US and Israeli taxes, bank accounts and investing.',
    'skip': 'Skip to content',
    'nav.label': 'Main',
    'nav.courses': 'Courses',
    'nav.fundChecker': 'Fund checker',
    'nav.deadlines': 'Deadlines',
    'nav.glossary': 'Glossary',
    'lang.label': 'Language',
    'footer.disclaimer':
      'This site is general education, not tax, legal or investment advice. Rules change every year and every situation is different — check your own case with a qualified US–Israel tax professional.',
    'footer.links': 'Site information',
    'footer.about': 'About',
    'footer.sources': 'Sources',
    'footer.contact': 'Contact',
    'footer.fullDisclaimer': 'Full disclaimer',
  },
  he: {
    'site.name': 'DualPath',
    'site.tagline': 'Money and taxes for Americans in Israel',
    'site.taglineLang': 'en',
    'site.description':
      'שיעורים חינמיים לאמריקאים שגרים בישראל: מיסים בארה״ב ובישראל, חשבונות בנק והשקעות.',
    'skip': 'דילוג לתוכן',
    'nav.label': 'ראשי',
    'nav.courses': 'קורסים',
    'nav.fundChecker': 'בודק ההשקעות',
    'nav.deadlines': 'מועדים',
    'nav.glossary': 'מילון מונחים',
    'lang.label': 'שפה',
    'footer.disclaimer':
      'האתר נועד ללימוד כללי בלבד ואינו מהווה ייעוץ מס, ייעוץ משפטי או ייעוץ השקעות. הכללים משתנים מדי שנה וכל מקרה שונה — בדקו את המקרה שלכם מול איש מקצוע מוסמך המתמחה במיסוי ארה״ב–ישראל.',
    'footer.links': 'מידע על האתר',
    'footer.about': 'אודות',
    'footer.sources': 'מקורות',
    'footer.contact': 'יצירת קשר',
    'footer.fullDisclaimer': 'הבהרה משפטית מלאה',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)['en'];
