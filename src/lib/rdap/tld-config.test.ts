import { describe, it, expect } from 'vitest';
import { TLD_CONFIGS, TLD_MAP, DEFAULT_TLDS } from './tld-config';

describe('TLD Configuration', () => {
  it('has 14 TLD entries', () => {
    expect(TLD_CONFIGS).toHaveLength(14);
  });

  it('all configs have required fields', () => {
    for (const config of TLD_CONFIGS) {
      expect(config.tld).toBeTruthy();
      expect(config.label).toBe(`.${config.tld}`);
      expect(typeof config.price).toBe('number');
      expect(config.price).toBeGreaterThan(0);
      // rdapServer can be null (for .taco)
      expect(config.rdapServer === null || typeof config.rdapServer === 'string').toBe(true);
    }
  });

  it('TLD_MAP lookups work correctly', () => {
    expect(TLD_MAP['com'].price).toBe(12.99);
    expect(TLD_MAP['taco'].price).toBe(4.2);
    expect(TLD_MAP['nonexistent']).toBeUndefined();
  });

  it('prices match expected values', () => {
    expect(TLD_MAP['com'].price).toBe(12.99);
    expect(TLD_MAP['io'].price).toBe(39.99);
    expect(TLD_MAP['ai'].price).toBe(79.99);
    expect(TLD_MAP['taco'].price).toBe(4.2);
    expect(TLD_MAP['xyz'].price).toBe(1.99);
    expect(TLD_MAP['co'].price).toBe(29.99);
  });

  it('.taco has null rdapServer', () => {
    expect(TLD_MAP['taco'].rdapServer).toBeNull();
  });

  it('DEFAULT_TLDS has 10 entries', () => {
    expect(DEFAULT_TLDS).toHaveLength(10);
  });

  it('DEFAULT_TLDS includes key TLDs', () => {
    expect(DEFAULT_TLDS).toContain('com');
    expect(DEFAULT_TLDS).toContain('taco');
    expect(DEFAULT_TLDS).toContain('io');
    expect(DEFAULT_TLDS).toContain('ai');
  });
});
