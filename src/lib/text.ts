/** Lowercases and strips accents and punctuation, so "Bear & Bear" matches "bear bear". */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9%]+/g, ' ')
    .trim();
}

/** True when every word of the query appears somewhere in the haystack. */
export function matchesAll(haystack: string, query: string): boolean {
  const words = normalise(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const text = normalise(haystack);
  return words.every((word) => text.includes(word));
}
