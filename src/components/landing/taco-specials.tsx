const specials = [
  {
    emoji: '🌶️',
    title: 'Spicy Mode',
    description: 'Advanced DNS settings for power users. Raw zone editing, custom resolvers, experimental features.',
  },
  {
    emoji: '🔔',
    title: 'Taco Bell',
    description: 'Notification center that rings when domains expire. SMS, email, Slack, Discord.',
  },
  {
    emoji: '💃',
    title: 'Salsa Sync',
    description: 'One-click DNS config sync across all your domains. Change once, apply everywhere.',
  },
  {
    emoji: '🥑',
    title: 'Guac Guard',
    description: 'Premium security: DNSSEC, DDoS protection, domain lock, 2FA for transfers.',
  },
];

export function TacoSpecials() {
  return (
    <section className="max-w-[1240px] mx-auto px-6 py-[100px]">
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[3px] text-fire mb-3">
        {'// Secret menu'}
      </p>
      <h2 className="font-[family-name:var(--font-anybody)] text-[clamp(1.8rem,4vw,2.8rem)] font-black mb-4">
        Taco Specials
      </h2>
      <p className="text-text2 max-w-xl mb-10">
        Exclusive features you won&apos;t find anywhere else. Because we&apos;re not like other registrars.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {specials.map((special) => (
          <div
            key={special.title}
            className="group relative bg-gradient-to-br from-bg2 to-surface border border-border rounded-[--radius-default] p-[30px_24px] text-center overflow-hidden transition-all duration-300 hover:-translate-y-[3px] hover:border-fire"
          >
            {/* Radial gradient overlay on hover */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,87,34,0.07),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            <span className="text-[44px] mb-3.5 block relative z-10">{special.emoji}</span>
            <h3 className="font-[family-name:var(--font-anybody)] font-bold text-base mb-2 relative z-10">
              {special.title}
            </h3>
            <p className="text-xs text-text2 relative z-10">{special.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
