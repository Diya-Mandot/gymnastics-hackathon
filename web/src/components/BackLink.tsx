"use client";

import { useRouter } from "next/navigation";

/** Goes back to wherever the visitor came from on this site, or to a sensible page if they arrived directly (e.g. a QR scan). */
export function BackLink({ fallback, label = "Back", className = "" }: { fallback: string; label?: string; className?: string }) {
  const router = useRouter();
  function go() {
    const fromHere = typeof document !== "undefined" && document.referrer.startsWith(window.location.origin);
    if (fromHere && window.history.length > 1) router.back();
    else router.push(fallback);
  }
  return (
    <button onClick={go} className={`inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-2 text-sm font-medium text-ink backdrop-blur hover:border-ink ${className}`}>
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}
