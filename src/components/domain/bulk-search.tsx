'use client';

import { useState } from 'react';
import { searchInputSchema } from '@/lib/validators/domain.schema';

interface BulkSearchProps {
  onSearch: (domains: string[]) => void;
}

export function BulkSearch({ onSearch }: BulkSearchProps) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  function handleSearch() {
    const lines = text
      .split('\n')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setStatus('Enter at least one domain');
      return;
    }

    const valid: string[] = [];
    let skipped = 0;

    for (const line of lines) {
      const result = searchInputSchema.safeParse(line);
      if (result.success) {
        valid.push(result.data);
      } else {
        skipped++;
      }
    }

    if (valid.length === 0) {
      setStatus('All entries were invalid');
      return;
    }

    const capped = valid.slice(0, 50);
    const msg = skipped > 0
      ? `Searching ${capped.length} domains (${skipped} invalid skipped)`
      : `Searching ${capped.length} domains`;
    setStatus(msg);

    onSearch(capped);
  }

  return (
    <div className="mt-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Enter one domain per line, e.g.\ntaco-shop.com\nsalsa-hub.io\nguac-lord.dev`}
        className="w-full min-h-[100px] resize-y bg-bg2 border border-border rounded-[--radius-sm] p-3.5 font-mono text-[13px] text-text placeholder:text-text4 outline-none focus:border-fire transition-colors"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-text3">{status}</span>
        <button
          onClick={handleSearch}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-fire via-[#ff9800] to-gold text-black text-sm font-bold font-[family-name:var(--font-anybody)] hover:shadow-[0_4px_16px_rgba(255,87,34,0.3)] hover:-translate-y-0.5 transition-all"
        >
          Search All
        </button>
      </div>
    </div>
  );
}
