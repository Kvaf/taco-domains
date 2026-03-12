import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  featured?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Mild',
    description: 'Personal projects',
    price: '$0',
    period: 'Free forever',
    features: [
      '1 free domain (.xyz)',
      'Free DNS hosting',
      'Free SSL certificate',
      'Email forwarding (1 alias)',
      'Basic support',
    ],
    buttonText: 'Start Free',
  },
  {
    name: 'Medium',
    description: 'Growing businesses',
    price: '$9',
    period: 'Billed annually',
    features: [
      'Up to 25 domains',
      'Advanced DNS + DNSSEC',
      'Wildcard SSL',
      'Unlimited email forwards',
      'Branded shortlinks',
      'API access',
      'Priority support',
    ],
    buttonText: 'Get Medium',
    featured: true,
  },
  {
    name: 'Extra Spicy',
    description: 'Agencies & power users',
    price: '$29',
    period: 'Billed annually',
    features: [
      'Unlimited domains',
      'All DNS + zone export',
      'EV SSL certificates',
      'Team billing & permissions',
      'Marketplace seller tools',
      'Full API + webhooks + SDKs',
      'Dedicated support + SLA',
      'All Taco Specials',
    ],
    buttonText: 'Go Extra Spicy',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="max-w-[1240px] mx-auto px-6 py-[100px]">
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[3px] text-fire mb-3">
        {'// Transparent pricing'}
      </p>
      <h2 className="font-[family-name:var(--font-anybody)] text-[clamp(1.8rem,4vw,2.8rem)] font-black mb-4">
        Simple, Honest Pricing
      </h2>
      <p className="text-text2 max-w-xl mb-10">
        No hidden fees. No surprises. Just spicy-good value.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 items-start">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              'relative bg-bg2 border rounded-[--radius-default] p-[36px_28px] transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_0_40px_rgba(255,87,34,0.06)]',
              tier.featured
                ? 'border-fire bg-gradient-to-b from-fire/5 to-bg2'
                : 'border-border'
            )}
          >
            {/* Most Popular badge */}
            {tier.featured && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fire via-[#ff9800] to-gold text-black px-[18px] py-[5px] rounded-full text-[10px] font-extrabold tracking-[1px] whitespace-nowrap">
                MOST POPULAR
              </div>
            )}

            <div className="font-[family-name:var(--font-anybody)] text-xl font-bold mb-1.5">
              {tier.name}
            </div>
            <div className="text-[13px] text-text2 mb-5">{tier.description}</div>
            <div className="font-[family-name:var(--font-anybody)] text-[44px] font-black mb-0.5">
              {tier.price}
              <span className="text-[15px] text-text2 font-normal">/mo</span>
            </div>
            <div className="text-xs text-text3 mb-7">{tier.period}</div>

            <ul className="space-y-1.5 mb-7">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-[13px] text-text2 py-1.5"
                >
                  <span className="text-cyan font-bold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={cn(
                'w-full py-3.5 rounded-full font-[family-name:var(--font-anybody)] text-sm font-bold cursor-pointer transition-all duration-300',
                tier.featured
                  ? 'bg-gradient-to-r from-fire via-[#ff9800] to-gold text-black hover:shadow-[0_6px_28px_rgba(255,87,34,0.3)] hover:-translate-y-0.5'
                  : 'bg-transparent text-text border-2 border-border hover:border-fire hover:text-fire'
              )}
            >
              {tier.buttonText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
