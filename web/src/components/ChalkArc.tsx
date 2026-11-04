/** The signature motif: a thin chalk line tracing a routine's flight path. */
export function ChalkArc({ className = "", dashed = false }: { className?: string; dashed?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 600 300" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M2 290 C 150 40, 380 -20, 598 170"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={dashed ? "1 9" : undefined}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
