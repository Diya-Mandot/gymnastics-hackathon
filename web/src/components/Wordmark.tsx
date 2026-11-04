// Placeholder wordmark until Raghav's version lands.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="26" height="18" viewBox="0 0 26 18" aria-hidden="true">
        <path d="M1.5 16.5 C 6 3, 15 -1, 24.5 8" fill="none" stroke="#cc0000" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24.5" cy="8" r="1.6" fill="#cc0000" />
      </svg>
      <span className="font-display text-[24px] leading-none text-ink">
        Rock the <em>Routine</em>
      </span>
    </span>
  );
}
