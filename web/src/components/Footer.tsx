"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicGroups, teamLinks } from "./NavBar";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/support/") || pathname.startsWith("/demo")) return null;

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-5 max-w-sm font-display text-3xl text-ink">Every routine ends. <em>Its impact should not.</em></p>
          <p className="mt-6 max-w-md text-xs leading-relaxed text-faint">
            Prototype for the Red Rocks AI Innovation Challenge 2026. Athlete photos are real Red Rocks images supplied by the
            organizers; athlete names, stories, quotes and stats are demo content. Sponsors and supporters are fictional. Demo
            contributions never process a payment.
          </p>
        </div>
        {[...publicGroups, { title: "WRTH team", links: teamLinks }].map((g) => (
          <FooterCol key={g.title} title={g.title} links={g.links.map((l) => [l.href, l.label] as [string, string])} />
        ))}
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="label">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-muted hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
