export interface DomainCheckResult {
  domain: string;
  tld: string;
  available: boolean | 'unknown';
  price: number;
  source: 'rdap' | 'dns' | 'local' | 'simulated';
}
