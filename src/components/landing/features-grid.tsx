import { cn } from '@/lib/utils';

type TagType = 'hot' | 'free' | 'new' | 'pro';

interface Feature {
  icon: string;
  title: string;
  description: string;
  tag?: TagType;
}

const tagStyles: Record<TagType, string> = {
  hot: 'bg-red/10 text-red',
  free: 'bg-cyan/10 text-cyan',
  new: 'bg-fire/10 text-fire',
  pro: 'bg-gold/10 text-gold',
};

const tagLabels: Record<TagType, string> = {
  hot: 'HOT',
  free: 'FREE',
  new: 'NEW',
  pro: 'PRO',
};

const features: Feature[] = [
  {
    icon: '🔍',
    title: 'Domain Search & Registration',
    description: 'Real-time availability checker with bulk search. All major TLDs. One-click registration with WHOIS privacy toggle.',
    tag: 'hot',
  },
  {
    icon: '📊',
    title: 'Management Dashboard',
    description: 'Centralized control panel. Renewal reminders, auto-renew toggle, domain forwarding & parking.',
  },
  {
    icon: '🌐',
    title: 'DNS Hosting & Management',
    description: 'Free, fast, anycast DNS. Custom TTL, DNSSEC support, zone file import/export.',
    tag: 'free',
  },
  {
    icon: '📧',
    title: 'Email Forwarding & MX',
    description: 'Simple forwarding — contact@yourdomain → your@gmail.com. MX wizard included.',
  },
  {
    icon: '🔒',
    title: 'SSL/TLS Certificates',
    description: "Free Let's Encrypt auto-install & renew. Premium OV/EV options. One-click HTTPS.",
    tag: 'free',
  },
  {
    icon: '🏪',
    title: 'Domain Marketplace',
    description: 'Buy/sell domains. Auction system for expiring & premium domains. Secure escrow.',
    tag: 'new',
  },
  {
    icon: '🔗',
    title: 'Shortlinks & Subdomains',
    description: 'Branded short URLs like go.taco.domains/yourlink. Vanity subdomains with click analytics.',
  },
  {
    icon: '⚡',
    title: 'Developer API',
    description: 'RESTful API for domain/DNS automation. Webhooks, CLI tool, Node.js & Python SDKs.',
    tag: 'pro',
  },
  {
    icon: '💬',
    title: 'Support & Education',
    description: 'AI chatbot + live chat. "Taco Tips" guides & videos. Community forum & Discord.',
  },
  {
    icon: '💰',
    title: 'Billing & Subscriptions',
    description: 'Transparent pricing. Wallet system for prepaid credits. Team billing & referral rewards.',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="max-w-[1240px] mx-auto px-6 py-[100px]">
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[3px] text-fire mb-3">
        {'// All the toppings'}
      </p>
      <h2 className="font-[family-name:var(--font-anybody)] text-[clamp(1.8rem,4vw,2.8rem)] font-black mb-4">
        Everything You Need
      </h2>
      <p className="text-text2 max-w-xl mb-10">
        From registration to DNS management, SSL to marketplace — your entire domain lifecycle, wrapped up tight.
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative bg-bg2 border border-border rounded-[--radius-default] p-[34px_30px] overflow-hidden transition-all duration-300 hover:bg-bg3 hover:border-fire/20 hover:-translate-y-[3px] hover:shadow-lg before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-fire before:via-[#ff9800] before:to-gold before:scale-x-0 before:origin-left before:transition-transform before:duration-400 group-hover:before:scale-x-100"
          >
            <span className="text-[32px] block mb-4">{feature.icon}</span>
            <h3 className="font-[family-name:var(--font-anybody)] font-bold text-base mb-2">
              {feature.title}
            </h3>
            <p className="text-[13px] text-text2 leading-relaxed">{feature.description}</p>
            {feature.tag && (
              <span
                className={cn(
                  'inline-block text-[10px] font-bold uppercase tracking-[1px] px-2.5 py-0.5 rounded-full mt-3.5',
                  tagStyles[feature.tag]
                )}
              >
                {tagLabels[feature.tag]}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
