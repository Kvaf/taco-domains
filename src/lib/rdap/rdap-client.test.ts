import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkSingleDomain, checkDomains } from './rdap-client';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('checkSingleDomain', () => {
  it('returns available=true with source=simulated for .taco', async () => {
    const result = await checkSingleDomain('test.taco');
    expect(result.available).toBe(true);
    expect(result.source).toBe('simulated');
    expect(result.price).toBe(4.2);
    // Should NOT call fetch for .taco
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns available=true on RDAP 404', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
    });

    const result = await checkSingleDomain('available-domain.com');
    expect(result.available).toBe(true);
    expect(result.source).toBe('rdap');
  });

  it('returns available=false on RDAP 200 with domain data', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({
        objectClassName: 'domain',
        ldhName: 'google.com',
      }),
    });

    const result = await checkSingleDomain('google.com');
    expect(result.available).toBe(false);
    expect(result.source).toBe('rdap');
  });

  it('falls back to DNS on RDAP failure', async () => {
    // RDAP fetch throws
    mockFetch.mockRejectedValueOnce(new Error('timeout'));
    // DNS fallback fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Status: 3 }), // NXDOMAIN
    });

    const result = await checkSingleDomain('test-fallback.com');
    expect(result.source).toBe('dns');
    expect(result.available).toBe(true);
  });

  it('returns unknown for unrecognized TLD', async () => {
    const result = await checkSingleDomain('test.unknowntld');
    expect(result.available).toBe('unknown');
    expect(result.price).toBe(0);
  });
});

describe('checkDomains', () => {
  it('processes multiple domains and returns array', async () => {
    // .taco doesn't need fetch, .com does
    mockFetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
    });

    const results = await checkDomains(['test.taco', 'test.com']);
    expect(results).toHaveLength(2);
    expect(results[0].domain).toBe('test.taco');
    expect(results[1].domain).toBe('test.com');
  });
});
