"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { allowedGroups, canView, describe, groups, type Audience } from "@/lib/audience";
import { athleteBySlug } from "@/lib/seed";
import { useAudience } from "./AudienceProvider";

/** Wraps an area meant for particular groups. Others see who it's for and a one-click way in. */
export function AudienceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { audience, ready, signIn } = useAudience();

  if (!allowedGroups(pathname)) return <>{children}</>; // open to everyone, render straight away
  if (!ready) return <div className="min-h-[60svh]" aria-busy="true" />;
  if (canView(audience, pathname)) return <>{children}</>;

  const allow = allowedGroups(pathname) ?? [];
  const slug = pathname.startsWith("/portal/") ? pathname.split("/")[2] : undefined;
  const portalAthlete = slug ? athleteBySlug(slug) : undefined;

  // One-click demo identities for this area.
  const options: { label: string; as: Audience }[] = allow.map((g) =>
    g === "athlete"
      ? { label: `Continue as ${portalAthlete?.name ?? "an athlete"}`, as: { group: "athlete", athleteSlug: portalAthlete?.slug ?? "avery" } }
      : { label: g === "team" ? "Continue as WRTH team" : `Continue as a ${groups[g].label.toLowerCase()}`, as: { group: g } },
  );

  const ownPortal = audience?.group === "athlete" && audience.athleteSlug && audience.athleteSlug !== slug;

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-2xl flex-col justify-center px-4 py-24 sm:px-8">
      <p className="label">For {allow.map((g) => groups[g].short).join(" and ")}</p>
      <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">This area isn’t part of your view.</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        {audience ? <>You’re signed in as <b className="text-ink">{describe(audience)}</b>. </> : null}
        {ownPortal
          ? "Athletes only see their own portal."
          : groups[allow[0]].blurb}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {ownPortal ? (
          <Link href={`/portal/${audience!.athleteSlug}`} className="btn btn-red">Go to my portal</Link>
        ) : (
          options.map((o, i) => (
            <button key={o.label} className={i === 0 ? "btn btn-red" : "btn btn-line"} onClick={() => signIn({ ...o.as, name: audience?.name })}>
              {o.label}
            </button>
          ))
        )}
        <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className="btn btn-line">Choose a different view</Link>
      </div>
      <p className="mt-6 text-xs text-faint">Demo sign-in: no password, remembered on this device only.</p>
    </section>
  );
}
