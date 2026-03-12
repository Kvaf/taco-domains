const steps = [
  {
    number: '01',
    icon: '🔍',
    title: 'Search',
    description: 'Type your dream domain. We check availability in real-time across all major TLDs.',
  },
  {
    number: '02',
    icon: '🛒',
    title: 'Register',
    description: 'One-click registration with WHOIS privacy. No upsells, no tricks, no hidden fees.',
  },
  {
    number: '03',
    icon: '🚀',
    title: 'Launch',
    description: 'Point your DNS, set up email, enable SSL — all from one delicious dashboard.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-[1240px] mx-auto px-6 py-[100px]">
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[3px] text-fire mb-3">
        {'// It\'s easy, promise'}
      </p>
      <h2 className="font-[family-name:var(--font-anybody)] text-[clamp(1.8rem,4vw,2.8rem)] font-black mb-4">
        How It Works
      </h2>
      <p className="text-text2 max-w-xl mb-10">
        Three simple steps. Easier than ordering a taco. (Almost.)
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="group relative bg-bg2 border border-border rounded-[--radius-default] p-8 text-center transition-all duration-300 hover:border-fire hover:-translate-y-[3px]"
          >
            {/* Large faded counter */}
            <span className="absolute top-2.5 left-5 font-[family-name:var(--font-anybody)] text-[52px] font-black text-fire/10">
              {step.number}
            </span>

            <span className="text-4xl mb-3 block relative z-10">{step.icon}</span>
            <h4 className="font-[family-name:var(--font-anybody)] font-bold mb-1.5 relative z-10">
              {step.title}
            </h4>
            <p className="text-[13px] text-text2 relative z-10">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
