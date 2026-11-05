"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { allowedGroups, canView, describe, groups, type Audience } from "@/lib/audience";
import { athleteBySlug, athletes } from "@/lib/seed";
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

  // Business areas get a proper welcome instead of a bare "not your view" message.
  if (allow.includes("business") && !ownPortal) {
    return <BusinessWelcome options={options} signedInAs={audience ? describe(audience) : null} onPick={(as) => signIn({ ...as, name: audience?.name })} pathname={pathname} />;
  }

  return (
    <section data-testid="audience-gate" className="mx-auto flex min-h-[70svh] max-w-2xl flex-col justify-center px-4 py-24 sm:px-8">
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

const perks = [
  { tone: "text-sky bg-sky-soft", title: "Reach Utah families", body: "Huntsman Center crowds and the athletes’ own followers, in one campaign.", icon: "M3 12h4l3 8 4-16 3 8h4" },
  { tone: "text-gold bg-gold-soft", title: "Real community stories", body: "Clinics, school visits and meet nights led by a Red Rock you choose.", icon: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" },
  { tone: "text-green bg-[color-mix(in_srgb,var(--color-green)_15%,transparent)]", title: "Results you can measure", body: "QR scans, offer claims and new customers, reported back to you.", icon: "M4 20V10m6 10V4m6 16v-7m4 7H2" },
];

function BusinessWelcome({ options, signedInAs, onPick, pathname }: {
  options: { label: string; as: Audience }[];
  signedInAs: string | null;
  onPick: (as: Audience) => void;
  pathname: string;
}) {
  return (
    <section data-testid="audience-gate">
      <div className="on-photo relative overflow-hidden">
        <Image src="/images/arena-scoreboard.jpg" alt="Sponsor boards above the floor at the Huntsman Center" fill priority sizes="100vw" className="object-cover object-[center_35%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_14_13/0.94)_0%,rgb(15_14_13/0.78)_50%,rgb(120_0_0/0.35)_100%),linear-gradient(180deg,transparent_65%,#0f0e0d_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-8 sm:pt-24">
          <p className="text-sm font-semibold text-red-lit">For local and national businesses</p>
          <h1 className="mt-3 max-w-[16ch] font-display text-[clamp(48px,6.5vw,92px)] leading-[0.95] text-white">
            Put your brand behind a <em className="text-red-lit">Red Rocks story.</em>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Answer six quick questions and we’ll match you with athletes whose causes and audience fit your business.
          </p>
          {signedInAs && <p className="mt-3 text-sm text-white/65">You’re signed in as {signedInAs}. Switch to a business view to continue.</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {options.map((o, i) => (
              <button key={o.label} className={i === 0 ? "btn btn-red" : "btn btn-line"} onClick={() => onPick(o.as)}>
                {i === 0 ? "Get matched as a business" : o.label}
              </button>
            ))}
            <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className="btn btn-line">Choose a different view</Link>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3" aria-hidden="true">
              {athletes.map((a) => (
                <span key={a.slug} className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#0f0e0d] bg-white">
                  {a.photo && <Image src={a.photo} alt="" fill sizes="48px" className="object-cover object-[50%_20%]" />}
                </span>
              ))}
            </div>
            <p className="text-sm text-white/75">{athletes.map((a) => a.firstName).join(", ")} and the 2027 roster</p>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 pb-20 pt-4 sm:px-8 md:grid-cols-3">
        {perks.map((p) => (
          <article key={p.title} className="card p-6">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${p.tone}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={p.icon} /></svg>
            </span>
            <h2 className="mt-4 font-display text-3xl text-ink">{p.title}</h2>
            <p className="mt-2 text-muted">{p.body}</p>
          </article>
        ))}
        <p className="text-xs text-faint md:col-span-3">Demo sign-in: no password, remembered on this device only.</p>
      </div>
    </section>
  );
}
