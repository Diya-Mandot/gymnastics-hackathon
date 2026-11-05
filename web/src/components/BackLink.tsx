"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Pages visited in this tab, so "Back" knows whether there is an in-site page to return to.
// Client-side navigation doesn't update document.referrer, so we track it ourselves.
const KEY = "rtr:visited";

function readStack(): string[] {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? "[]") as string[]; } catch { return []; }
}
function writeStack(stack: string[]) {
  try { sessionStorage.setItem(KEY, JSON.stringify(stack.slice(-50))); } catch {}
}

/** Mount once (in the layout) to record each page the visitor opens. */
export function useTrackVisits() {
  const pathname = usePathname();
  useEffect(() => {
    const stack = readStack();
    if (stack[stack.length - 1] === pathname) return;
    if (stack[stack.length - 2] === pathname) stack.pop(); // went back
    else stack.push(pathname);
    writeStack(stack);
  }, [pathname]);
}

/** Goes back to the previous page on this site, or to `fallback` if they arrived directly (e.g. a QR scan). */
export function BackLink({ fallback, label = "Back", className = "" }: { fallback: string; label?: string; className?: string }) {
  const router = useRouter();
  function go() {
    if (readStack().length > 1) router.back();
    else router.push(fallback);
  }
  return (
    <button onClick={go} className={`inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-2 text-sm font-medium text-ink backdrop-blur hover:border-ink ${className}`}>
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}
