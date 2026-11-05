"use client";

import { usePathname } from "next/navigation";
import { BackLink, useTrackVisits } from "./BackLink";

/**
 * A back button at the top-left of every page, just under the nav (or at the top
 * on screens without a nav, like the phone QR flow). Always shown.
 */
export function BackBar() {
  const pathname = usePathname();
  useTrackVisits();
  const parts = pathname.split("/").filter(Boolean);

  // If someone lands here directly (QR code, shared link), go up one level instead of leaving the site.
  const fallback = parts.length > 1 ? `/${parts.slice(0, -1).join("/")}` : "/";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-8 sm:pt-5">
      <BackLink fallback={fallback} />
    </div>
  );
}
