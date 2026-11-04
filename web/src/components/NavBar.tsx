"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";

type NavLink = { href: string; label: string };

// Public site, grouped by who it's for.
export const publicGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Fans",
    links: [
      { href: "/athletes", label: "Athletes" },
      { href: "/cards", label: "Cards" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    title: "Businesses",
    links: [
      { href: "/match", label: "Get Matched" },
      { href: "/routines", label: "Impact Routines" },
    ],
  },
];

// WRTH team workspace: athletes, staff and sponsorship tools.
export const teamLinks: NavLink[] = [
  { href: "/portal", label: "Athlete Portal" },
  { href: "/sponsors", label: "Sponsor Engine" },
  { href: "/admin", label: "Live campaign" },
  { href: "/admin/revenue", label: "Revenue" },
];

const TEAM_PREFIXES = ["/portal", "/sponsors", "/admin"];
const isTeamPath = (pathname: string) => TEAM_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // The phone QR flow and presenter views stay chrome-free.
  if (pathname.startsWith("/support/") || pathname.startsWith("/demo")) return null;

  const team = isTeamPath(pathname);
  const all = team ? teamLinks : publicGroups.flatMap((g) => g.links);
  // Most specific match wins, so /admin/revenue highlights "Revenue" and not also "Live campaign".
  const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const active = (href: string) => matches(href) && !all.some((l) => l.href !== href && l.href.startsWith(href) && matches(l.href));

  const navLink = (l: NavLink) => (
    <Link
      href={l.href}
      aria-current={active(l.href) ? "page" : undefined}
      className={`relative text-[14px] font-medium transition-colors ${active(l.href) ? "text-ink" : "text-muted hover:text-ink"}`}
    >
      {l.label}
      {active(l.href) && <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-red" />}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-8" aria-label="Main">
        <div className="flex items-center gap-3">
          <Link href={team ? "/portal" : "/"} aria-label={team ? "Team workspace home" : "Rock the Routine home"}>
            <Wordmark />
          </Link>
          {team && <span className="tag !bg-red-soft !text-red-dark">WRTH team</span>}
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          {team ? (
            <ul className="flex items-center gap-6">
              {teamLinks.map((l) => (
                <li key={l.href}>{navLink(l)}</li>
              ))}
            </ul>
          ) : (
            publicGroups.map((g) => (
              <div key={g.title} className="flex items-center gap-5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{g.title}</span>
                <ul className="flex items-center gap-5">
                  {g.links.map((l) => (
                    <li key={l.href}>{navLink(l)}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {team ? (
            <Link href="/" className="text-sm text-muted hover:text-ink">← Public site</Link>
          ) : (
            <>
              <Link href="/portal" className="text-sm text-muted hover:text-ink">Team</Link>
              <Link href="/support/avery" className="btn btn-red !px-5 !py-2.5 text-sm">Back a gymnast</Link>
            </>
          )}
        </div>

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
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-line px-4 pb-6 pt-2 lg:hidden">
          {(team ? [{ title: "WRTH team", links: teamLinks }] : publicGroups).map((g) => (
            <div key={g.title} className="pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{g.title}</p>
              <ul>
                {g.links.map((l) => (
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
            </div>
          ))}
          <div className="flex gap-3 pt-5">
            {team ? (
              <Link href="/" className="btn btn-line w-full">← Public site</Link>
            ) : (
              <>
                <Link href="/portal" className="btn btn-line flex-1">Team</Link>
                <Link href="/support/avery" className="btn btn-red flex-1">Back a gymnast</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
