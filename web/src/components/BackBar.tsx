"use client";

import { usePathname } from "next/navigation";
import { BackLink, useTrackVisits } from "./BackLink";

/**
 * A back button at the top-left of every inner page, just under the nav.
 * Skipped on the home page, on pages with their own back link (athlete profiles),
 * and on the chrome-free phone QR flow and presenter screens.
 */
export function BackBar() {
  const pathname = usePathname();
  useTrackVisits();
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null; // home
  if (pathname.startsWith("/support/") || pathname.startsWith("/demo")) return null; // no nav there
  if (parts[0] === "athletes" && parts.length === 2) return null; // profile has "All athletes"

  // If someone lands here directly (QR code, shared link), go up one level instead of leaving the site.
  const fallback = parts.length > 1 ? `/${parts.slice(0, -1).join("/")}` : "/";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-8 sm:pt-5">
      <BackLink fallback={fallback} />
    </div>
  );
}
