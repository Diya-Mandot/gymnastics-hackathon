"use client";

import { DataTag } from "./Badges";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { directory } from "@/lib/audience";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/support/") || pathname.startsWith("/demo")) return null;

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-5 max-w-sm font-display text-3xl text-ink">Every routine ends. <em>Its impact should not.</em></p>
          <p className="mt-6 max-w-md text-xs leading-relaxed text-faint">
            Prototype for the Red Rocks AI Innovation Challenge 2026. Athletes are real Red Rocks gymnasts, shown with their
            permission; names, photos, hometowns and highlights are from utahutes.com. Causes, quotes, stories, social stats and
            campaign numbers are sample content. Sponsors and supporters are fictional. Demo contributions never process a payment.
          </p>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Data labels">
            <DataTag kind="fictional" /> <DataTag kind="simulated" /> <DataTag kind="estimate" /> <DataTag kind="live" />
          </div>
          <p className="mt-2 max-w-md text-xs text-faint">Fictional: made-up people or businesses. Simulated: demo actions, nothing real is sent, signed or paid. Estimate: modelled numbers. Live record: written by this app during the demo.</p>
        </div>
        {directory.map((g) => (
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
