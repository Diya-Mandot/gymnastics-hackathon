"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";

const links = [
  { href: "/", label: "Home" },
  { href: "/match", label: "Get Matched" },
  { href: "/athletes", label: "Athletes" },
  { href: "/cards", label: "Cards" },
  { href: "/routines", label: "Impact Routines" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/admin/revenue", label: "Revenue" },
  { href: "/support", label: "Support" },
  { href: "/portal", label: "Athlete Portal" },
  { href: "/admin", label: "Admin" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // The phone QR flow and presenter views stay chrome-free.
  if (pathname.startsWith("/support/") || pathname.startsWith("/demo")) return null;

  // Most specific match wins, so /admin/revenue highlights "Revenue" and not also "Admin".
  const matches = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const active = (href: string) => matches(href) && !links.some((l) => l.href !== href && l.href.startsWith(href) && matches(l.href));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8" aria-label="Main">
        <Link href="/" aria-label="Rock the Routine home">
          <Wordmark />
        </Link>
        <ul className="hidden items-center gap-6 xl:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className={`relative text-[14px] font-medium transition-colors ${active(l.href) ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                {l.label}
                {active(l.href) && <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-red" />}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/support/avery" className="btn btn-red hidden !px-5 !py-2.5 text-sm xl:inline-flex">
          Back a gymnast
        </Link>
        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface xl:hidden"
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
        <ul id="mobile-nav" className="border-t border-line px-4 pb-6 pt-2 xl:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`flex items-center justify-between border-b border-line py-4 font-display text-xl ${active(l.href) ? "text-ink" : "text-muted"}`}
              >
                {l.label}
                {active(l.href) && <span className="h-1.5 w-1.5 rounded-full bg-red" />}
              </Link>
            </li>
          ))}
          <li className="pt-5">
            <Link href="/support/avery" className="btn btn-red w-full">
              Back a gymnast
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
