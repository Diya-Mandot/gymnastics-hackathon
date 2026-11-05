"use client";

import { usePathname } from "next/navigation";
import { BackLink, useTrackVisits } from "./BackLink";

/**
 * Back button at the top-left of every page except the home page.
 * Goes to the previous page; if there isn't one (e.g. opened from a QR code), goes home.
 */
export function BackBar() {
  const pathname = usePathname();
  useTrackVisits();

  if (pathname === "/") return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-8 sm:pt-5">
      <BackLink fallback="/" />
    </div>
  );
}
