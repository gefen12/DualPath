// Search shared by the fund checker and the glossary. Matching ignores case,
// spaces, hyphens, Hebrew gershayim/geresh and quote marks, so "ta125",
// "ta-125", "תא 125" and "ת״א 125" all look the same.

const IGNORED = /[\s\-‐‑–—_״׳"'“”„’‘`()./]/g;

export function normalize(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, '') // Hebrew vowel points and cantillation marks
    .replace(IGNORED, '');
}

/** True when the normalized query is inside any of the fields. An empty query matches everything. */
export function matches(query: string, fields: readonly string[]): boolean {
  const q = normalize(query);
  if (!q) return true;
  return fields.some((field) => normalize(field).includes(q));
}
