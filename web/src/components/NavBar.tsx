"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { describe, groups, homeFor, navFor, type NavLink } from "@/lib/audience";
import { athleteBySlug } from "@/lib/seed";
import { useAudience } from "./AudienceProvider";
import { ThemeSwitch } from "./ThemeSwitch";
import { Wordmark } from "./Wordmark";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { audience, ready, signOut } = useAudience();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // The phone QR flow and presenter views stay chrome-free.
  if (pathname.startsWith("/support/") || pathname.startsWith("/demo")) return null;

  const links = navFor(audience);
  const team = audience?.group === "team";
  const who = audience
    ? audience.group === "athlete"
      ? athleteBySlug(audience.athleteSlug ?? "")?.name ?? "Athlete"
      : audience.name || describe(audience)
    : null;

  // Most specific match wins, so /admin/revenue highlights "Revenue" and not also "Live campaign".
  const matches = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
  const active = (href: string) => matches(href) && !links.some((l) => l.href !== href && l.href.startsWith(href) && matches(l.href));

  const navLink = (l: NavLink) => (
    <Link
      href={l.href}
      aria-current={active(l.href) ? "page" : undefined}
      className={`relative whitespace-nowrap text-[14px] font-medium transition-colors ${active(l.href) ? "text-ink" : "text-muted hover:text-ink"}`}
    >
      {l.label}
      {active(l.href) && <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-red" />}
    </Link>
  );

  const out = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-8" aria-label="Main">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Rock the Routine home" className="shrink-0 whitespace-nowrap">
            <Wordmark />
          </Link>
          {audience && (
            <span className={`tag hidden whitespace-nowrap xl:inline-flex ${team ? "!bg-red-soft !text-red-dark" : ""}`} data-testid="view-badge">
              {groups[audience.group].label} view
            </span>
          )}
        </div>

        <ul className="hidden items-center gap-5 lg:flex">
          {links.map((l) => (
            <li key={l.href}>{navLink(l)}</li>
          ))}
        </ul>

        <div className={`hidden items-center gap-3 lg:flex ${ready ? "" : "invisible"}`}>
          <ThemeSwitch compact />
          <span className="h-6 w-px bg-line" aria-hidden="true" />
          {audience ? (
            <>
              <Link
                href={homeFor(audience)}
                className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm text-ink transition-colors hover:border-ink/40"
                title="My home"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-red text-xs font-semibold text-white" aria-hidden="true">
                  {(who ?? "?").trim().charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[14ch] truncate">{who}</span>
                <span className="sr-only">, my home</span>
              </Link>
              <button onClick={out} className="text-sm text-muted hover:text-ink">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/join?mode=login" className="btn btn-line !px-4 !py-2 text-sm">Sign in</Link>
              <Link href="/support/avery" className="btn btn-red !px-4 !py-2 text-sm">Back a gymnast</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {ready && !audience && (
            <Link href="/join?mode=login" className="btn btn-line !px-4 !py-2 text-sm">Sign in</Link>
          )}
        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-2.5 w-4">
            <span className={`absolute left-0 h-[1.5px] w-4 bg-ink transition-all ${open ? "top-1 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-[1.5px] w-4 bg-ink transition-all ${open ? "top-1 -rotate-45" : "top-2.5"}`} />
          </span>
        </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-line px-4 pb-6 pt-2 lg:hidden">
          {audience && <p className="pt-3 text-sm text-muted">Signed in as <b className="text-ink">{who}</b> · {groups[audience.group].label}</p>}
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`flex items-center justify-between border-b border-line py-3.5 font-display text-xl ${active(l.href) ? "text-ink" : "text-muted"}`}
                >
                  {l.label}
                  {active(l.href) && <span className="h-1.5 w-1.5 rounded-full bg-red" />}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeSwitch className="pt-5" />
          <div className="flex gap-3 pt-5">
            {audience ? (
              <>
                <Link href={homeFor(audience)} className="btn btn-line flex-1">My home</Link>
                <button onClick={out} className="btn btn-line flex-1">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/join?mode=login" className="btn btn-line flex-1">Sign in</Link>
                <Link href="/support/avery" className="btn btn-red flex-1">Back a gymnast</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
