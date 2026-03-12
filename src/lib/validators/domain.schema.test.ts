import { describe, it, expect } from 'vitest';
import { domainLabelSchema, fullDomainSchema, searchInputSchema } from './domain.schema';

describe('domainLabelSchema', () => {
  it('accepts valid labels', () => {
    expect(domainLabelSchema.safeParse('taco-shop').success).toBe(true);
    expect(domainLabelSchema.safeParse('a').success).toBe(true);
    expect(domainLabelSchema.safeParse('hello123').success).toBe(true);
    expect(domainLabelSchema.safeParse('my-cool-domain').success).toBe(true);
  });

  it('accepts xn-- internationalized domain prefix', () => {
    expect(domainLabelSchema.safeParse('xn--nxasmq6b').success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = domainLabelSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects labels starting with hyphen', () => {
    const result = domainLabelSchema.safeParse('-start');
    expect(result.success).toBe(false);
  });

  it('rejects labels ending with hyphen', () => {
    const result = domainLabelSchema.safeParse('end-');
    expect(result.success).toBe(false);
  });

  it('rejects hyphens at positions 3-4 for non-xn domains', () => {
    const result = domainLabelSchema.safeParse('ab--cd');
    expect(result.success).toBe(false);
  });

  it('rejects labels over 63 characters', () => {
    const result = domainLabelSchema.safeParse('a'.repeat(64));
    expect(result.success).toBe(false);
  });

  it('rejects invalid characters', () => {
    expect(domainLabelSchema.safeParse('test!').success).toBe(false);
    expect(domainLabelSchema.safeParse('hello world').success).toBe(false);
    expect(domainLabelSchema.safeParse('UPPER').success).toBe(false);
  });
});

describe('fullDomainSchema', () => {
  it('accepts valid domains', () => {
    expect(fullDomainSchema.safeParse('example.com').success).toBe(true);
    expect(fullDomainSchema.safeParse('my-site.io').success).toBe(true);
  });

  it('transforms to lowercase', () => {
    const result = fullDomainSchema.safeParse('Example.COM');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('example.com');
    }
  });

  it('rejects invalid formats', () => {
    expect(fullDomainSchema.safeParse('nodot').success).toBe(false);
    expect(fullDomainSchema.safeParse('.com').success).toBe(false);
    expect(fullDomainSchema.safeParse('example.').success).toBe(false);
  });
});

describe('searchInputSchema', () => {
  it('accepts valid search inputs', () => {
    expect(searchInputSchema.safeParse('taco-shop').success).toBe(true);
    expect(searchInputSchema.safeParse('example.com').success).toBe(true);
    expect(searchInputSchema.safeParse('hello').success).toBe(true);
  });

  it('transforms to lowercase', () => {
    const result = searchInputSchema.safeParse('TacoShop');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('tacoshop');
    }
  });

  it('rejects empty input', () => {
    expect(searchInputSchema.safeParse('').success).toBe(false);
  });

  it('rejects invalid characters', () => {
    expect(searchInputSchema.safeParse('test!@#').success).toBe(false);
  });
});
