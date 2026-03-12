const services = [
  {
    icon: '🌐',
    title: 'Domain Registration',
    description: '.com, .io, .ai, .app, .se, .nu, .tech, .info — and if .taco existed, we\'d register it.',
  },
  {
    icon: '💡',
    title: 'Domain Brainstorming',
    description: 'Spicy suggestions guaranteed. We help you find the perfect name for your brand.',
  },
  {
    icon: '🏪',
    title: 'Brandable Marketplace',
    description: 'Browse premium brandable domains ready for your next project.',
  },
  {
    icon: '☁️',
    title: 'Web Hosting',
    description: 'Fast hosting with extra guac. SSL included. One-click deploy.',
  },
  {
    icon: '🔒',
    title: 'SSL Certificates',
    description: "Because even tacos need security. Free Let's Encrypt + premium options.",
  },
];

export function ServicesStrip() {
  return (
    <div className="bg-bg2 border-y border-border py-[60px] px-6">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-7">
          {services.map((service) => (
            <div key={service.title} className="text-center py-8 px-5">
              <span className="text-[40px] block mb-4">{service.icon}</span>
              <h4 className="font-[family-name:var(--font-anybody)] font-bold text-base mb-2">
                {service.title}
              </h4>
              <p className="text-sm text-text2">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
