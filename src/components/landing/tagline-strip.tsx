const taglines = [
  { emoji: '🌮', text: "Don't be shellfish", suffix: ' — claim your domain today!' },
  { emoji: '🔥', text: 'Hot domains.', suffix: ' Fresh ideas. Zero crumbs.' },
  { emoji: '🌶️', text: '', prefix: 'Your website deserves more than a ', highlight: 'boring burrito.' },
  { emoji: '🥑', text: '', prefix: 'Domain registration with ', highlight: 'extra guac', suffix: ' (optional)' },
  { emoji: '🔒', text: '', prefix: 'Even tacos need ', highlight: 'security.', suffix: ' Get SSL today.' },
  { emoji: '🚀', text: '', prefix: 'Street tacos meets ', highlight: 'Silicon Valley.' },
];

export function TaglineStrip() {
  // Duplicate for seamless infinite scroll
  const allTaglines = [...taglines, ...taglines];

  return (
    <div className="bg-surface border-y border-border overflow-hidden py-5">
      <div
        className="flex w-max"
        style={{ animation: 'scrollX 30s linear infinite' }}
      >
        {allTaglines.map((t, i) => (
          <span
            key={i}
            className="whitespace-nowrap px-10 font-[family-name:var(--font-anybody)] text-base font-bold text-text3"
          >
            {t.emoji}{' '}
            {t.prefix && <>{t.prefix}</>}
            {t.text && <em className="text-fire not-italic">{t.text}</em>}
            {t.highlight && <em className="text-fire not-italic">{t.highlight}</em>}
            {t.suffix && <>{t.suffix}</>}
          </span>
        ))}
      </div>
    </div>
  );
}
