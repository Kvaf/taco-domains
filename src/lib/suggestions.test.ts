import { describe, it, expect } from 'vitest';
import { generateSuggestions } from './suggestions';

describe('generateSuggestions', () => {
  it('generates suggestions array', () => {
    const suggestions = generateSuggestions('tacos', ['com']);
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('returns max 8 suggestions', () => {
    const suggestions = generateSuggestions('tacos', ['com', 'io', 'ai']);
    expect(suggestions.length).toBeLessThanOrEqual(8);
  });

  it('respects takenTlds exclusion', () => {
    const suggestions = generateSuggestions('tacos', ['com', 'io']);
    const hasTakenTld = suggestions.some((s) => s === 'tacos.com' || s === 'tacos.io');
    expect(hasTakenTld).toBe(false);
  });

  it('includes TLD alternatives', () => {
    const suggestions = generateSuggestions('tacos', ['com']);
    // Should suggest other TLDs like .io, .ai, etc.
    const hasAlternativeTld = suggestions.some((s) => s.startsWith('tacos.') && !s.endsWith('.com'));
    expect(hasAlternativeTld).toBe(true);
  });

  it('includes name variations', () => {
    const suggestions = generateSuggestions('tacos', ['com']);
    // Should include prefix or suffix variations
    const hasVariation = suggestions.some(
      (s) => s.includes('my') || s.includes('get') || s.includes('app') || s.includes('hq')
    );
    expect(hasVariation).toBe(true);
  });

  it('handles hyphenated names', () => {
    const suggestions = generateSuggestions('taco-shop', ['com']);
    // Should include dehyphenated version
    const hasDehyphenated = suggestions.some((s) => s.startsWith('tacoshop.'));
    expect(hasDehyphenated).toBe(true);
  });

  it('adds hyphen for long names without hyphens', () => {
    const suggestions = generateSuggestions('tacoshop', ['com']);
    // Should include hyphenated variation
    const hasHyphenated = suggestions.some((s) => s.includes('-') && s.endsWith('.com'));
    expect(hasHyphenated).toBe(true);
  });

  it('returns unique suggestions', () => {
    const suggestions = generateSuggestions('tacos', ['com']);
    const unique = new Set(suggestions);
    expect(unique.size).toBe(suggestions.length);
  });
});
