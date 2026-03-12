export interface TLDConfig {
  tld: string;
  rdapServer: string | null;
  price: number;
  label: string;
}

export const TLD_CONFIGS: TLDConfig[] = [
  { tld: 'com', rdapServer: 'https://rdap.verisign.com/com/v1', price: 12.99, label: '.com' },
  { tld: 'net', rdapServer: 'https://rdap.verisign.com/net/v1', price: 10.99, label: '.net' },
  { tld: 'org', rdapServer: 'https://rdap.org', price: 11.99, label: '.org' },
  { tld: 'io', rdapServer: 'https://rdap.org', price: 39.99, label: '.io' },
  { tld: 'ai', rdapServer: 'https://rdap.org', price: 79.99, label: '.ai' },
  { tld: 'app', rdapServer: 'https://rdap.org', price: 14.99, label: '.app' },
  { tld: 'dev', rdapServer: 'https://rdap.org', price: 12.99, label: '.dev' },
  { tld: 'xyz', rdapServer: 'https://rdap.org', price: 1.99, label: '.xyz' },
  { tld: 'tech', rdapServer: 'https://rdap.org', price: 6.99, label: '.tech' },
  { tld: 'se', rdapServer: 'https://rdap.org', price: 19.99, label: '.se' },
  { tld: 'nu', rdapServer: 'https://rdap.org', price: 14.99, label: '.nu' },
  { tld: 'info', rdapServer: 'https://rdap.org', price: 4.99, label: '.info' },
  { tld: 'co', rdapServer: 'https://rdap.org', price: 29.99, label: '.co' },
  { tld: 'taco', rdapServer: null, price: 4.20, label: '.taco' },
];

export const TLD_MAP: Record<string, TLDConfig> = Object.fromEntries(
  TLD_CONFIGS.map((c) => [c.tld, c])
);

export const DEFAULT_TLDS = ['com', 'io', 'ai', 'app', 'se', 'nu', 'tech', 'xyz', 'dev', 'taco'] as const;
