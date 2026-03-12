'use client';

import { useState, useCallback } from 'react';
import { searchInputSchema } from '@/lib/validators/domain.schema';
import { DEFAULT_TLDS } from '@/lib/rdap/tld-config';
import type { DomainCheckResult } from '@/lib/rdap/types';
import { SearchResults } from './search-results';
import { BulkSearch } from './bulk-search';

const TLD_PILLS = ['com', 'io', 'ai', 'app', 'se', 'nu', 'tech', 'xyz', 'dev'] as const;

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState<DomainCheckResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const searchDomains = useCallback(async (domains: string[]) => {
    setIsLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/domain/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Search failed');
        return;
      }

      const data = await response.json();
      setResults(data.results);
      setSuggestions(data.suggestions || []);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Enter a domain name to search');
      return;
    }

    const validation = searchInputSchema.safeParse(trimmed);
    if (!validation.success) {
      setError('Only letters, numbers, hyphens, and dots allowed');
      return;
    }

    const input = validation.data;

    // Check if user typed a full domain with TLD
    let domains: string[];
    const dotIndex = input.lastIndexOf('.');
    if (dotIndex > 0 && input.length - dotIndex - 1 >= 2) {
      // Has a TLD, search exact domain
      domains = [input];
    } else {
      // No TLD, expand to all defaults
      const name = input.replace(/\.$/, '');
      domains = DEFAULT_TLDS.map((tld) => `${name}.${tld}`);
    }

    searchDomains(domains);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }

  function handleTldClick(tld: string) {
    const current = query.trim().replace(/\.[a-z]+$/, '');
    setQuery(`${current}.${tld}`);
  }

  function handleSearchSuggestion(domain: string) {
    setQuery(domain);
    searchDomains([domain]);
  }

  function handleBulkSearch(domains: string[]) {
    searchDomains(domains);
  }

  return (
    <div id="search" className="w-full">
      {/* Search input */}
      <div className="flex rounded-full border-2 border-border bg-bg2 focus-within:border-fire focus-within:shadow-[0_0_24px_rgba(255,87,34,0.15)] transition-all overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Find your perfect domain name..."
          className="flex-1 bg-transparent px-6 py-4 text-text outline-none placeholder:text-text4 font-[family-name:var(--font-outfit)]"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-8 py-4 bg-gradient-to-r from-fire via-[#ff9800] to-gold text-black font-[family-name:var(--font-anybody)] font-bold text-sm hover:shadow-[0_4px_16px_rgba(255,87,34,0.3)] transition-all disabled:opacity-70"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red">{error}</p>
      )}

      {/* TLD pills */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {TLD_PILLS.map((tld) => (
          <button
            key={tld}
            onClick={() => handleTldClick(tld)}
            className="px-3 py-1 rounded-full text-xs text-text3 border border-border hover:border-fire hover:text-fire transition-all"
          >
            .{tld}
          </button>
        ))}
      </div>

      {/* Bulk search toggle */}
      <div className="flex items-center gap-2 mt-3 justify-center">
        <input
          type="checkbox"
          id="bulkCheck"
          checked={isBulkMode}
          onChange={(e) => setIsBulkMode(e.target.checked)}
          className="accent-fire"
        />
        <label htmlFor="bulkCheck" className="text-sm text-text3 cursor-pointer">
          Bulk domain search
        </label>
      </div>

      {/* Bulk search area */}
      {isBulkMode && <BulkSearch onSearch={handleBulkSearch} />}

      {/* Results */}
      <SearchResults
        results={results}
        suggestions={suggestions}
        isLoading={isLoading}
        onSearchSuggestion={handleSearchSuggestion}
      />
    </div>
  );
}
