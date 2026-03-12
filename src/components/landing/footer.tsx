import Image from 'next/image';
import Link from 'next/link';

const productLinks = [
  { label: 'Domain Search', href: '/#search' },
  { label: 'DNS Hosting', href: '/dashboard' },
  { label: 'Marketplace', href: '/dashboard' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'API', href: '#' },
];

const resourceLinks = [
  { label: 'Taco Tips Blog', href: '#' },
  { label: 'Documentation', href: '#' },
  { label: 'Status Page', href: '#' },
  { label: 'Discord Community', href: '#' },
  { label: 'Changelog', href: '#' },
];

const companyLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Contact', href: '#' },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-[72px] px-6 max-w-[1240px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-[52px]">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Image
              src="/taco_logo.png"
              alt="Taco Domains"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-[family-name:var(--font-anybody)] font-bold text-lg">
              Taco Domains
            </span>
          </div>
          <p className="text-text2 text-[13px] mt-2.5 max-w-[280px]">
            The spiciest domain registrar on the internet. Register, manage, and trade domains with
            extra flavor.
          </p>
        </div>

        {/* Products */}
        <div>
          <h5 className="text-[11px] uppercase tracking-[2px] text-text3 mb-4">Products</h5>
          <ul className="space-y-2">
            {productLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-text2 text-[13px] hover:text-text transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h5 className="text-[11px] uppercase tracking-[2px] text-text3 mb-4">Resources</h5>
          <ul className="space-y-2">
            {resourceLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-text2 text-[13px] hover:text-text transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h5 className="text-[11px] uppercase tracking-[2px] text-text3 mb-4">Company</h5>
          <ul className="space-y-2">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-text2 text-[13px] hover:text-text transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-7 border-t border-border text-[12px] text-text3 gap-2">
        <span>&copy; {new Date().getFullYear()} Taco Domains. All rights reserved.</span>
        <span className="font-[family-name:var(--font-mono)]">Made with salsa &amp; love</span>
      </div>
    </footer>
  );
}
