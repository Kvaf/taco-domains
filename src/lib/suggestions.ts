import { DEFAULT_TLDS } from '@/lib/rdap/tld-config';

const PREFIXES = ['my', 'get', 'try', 'use', 'go'] as const;
const SUFFIXES = ['app', 'hq', 'hub'] as const;

/**
 * Generate domain name suggestions when a domain is taken.
 * Strategies:
 * 1. Try other TLDs not in takenTlds (first batch)
 * 2. Hyphen toggling (remove if present, add at midpoint if absent and name > 6 chars)
 * 3. Prefix variations (my-, get-, try-, use-, go-) for .com
 * 4. Suffix variations (-app, -hq, -hub) for .com
 * 5. Remaining TLD alternatives
 *
 * @returns Up to 8 unique suggestions in "name.tld" format
 */
export function generateSuggestions(name: string, takenTlds: string[]): string[] {
  const suggestions: string[] = [];
  const seen = new Set<string>();
  const takenSet = new Set(takenTlds);

  function add(domain: string) {
    if (!seen.has(domain)) {
      seen.add(domain);
      suggestions.push(domain);
    }
  }

  const tldAlternatives = DEFAULT_TLDS.filter((tld) => !takenSet.has(tld));

  // Strategy 1: A few TLD alternatives first
  for (const tld of tldAlternatives.slice(0, 4)) {
    add(`${name}.${tld}`);
  }

  // Strategy 2: Hyphen toggling (prioritized to ensure inclusion)
  if (name.includes('-')) {
    const dehyphenated = name.replace(/-/g, '');
    add(`${dehyphenated}.com`);
  } else if (name.length > 6) {
    const mid = Math.floor(name.length / 2);
    const hyphenated = `${name.slice(0, mid)}-${name.slice(mid)}`;
    add(`${hyphenated}.com`);
  }

  // Strategy 3: Prefix variations for .com
  for (const prefix of PREFIXES) {
    add(`${prefix}${name}.com`);
  }

  // Strategy 4: Suffix variations for .com
  for (const suffix of SUFFIXES) {
    add(`${name}${suffix}.com`);
  }

  // Strategy 5: Remaining TLD alternatives
  for (const tld of tldAlternatives.slice(4)) {
    add(`${name}.${tld}`);
  }

  return suggestions.slice(0, 8);
}
