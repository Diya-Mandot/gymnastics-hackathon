"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient, authConfigured, loadAuthProfile, type AppRole } from "@/lib/auth";
import { Wordmark } from "./Wordmark";

const links: Record<AppRole, Array<[string, string]>> = {
  fan: [["/fan", "Fan HQ"], ["/live", "Play"], ["/live/cards", "Cards"], ["/live/rewards", "Rewards"], ["/live/meet", "Meet"], ["/support", "Support"], ["/sponsorship", "Tiers"]],
  business: [["/business", "Business Home"], ["/match", "Get Matched"], ["/athletes", "Athletes"], ["/routines", "Campaigns"], ["/sponsorship", "Tiers"]],
  athlete: [["/portal/avery", "My Studio"], ["/athletes", "Roster"]],
  staff: [["/team/live", "Live Control"], ["/team/live/analytics", "Analytics"], ["/admin", "Revenue"]],
};
export const publicGroups = [{ title: "Fans", links: [{ href: "/live", label: "Play" }, { href: "/athletes", label: "Athletes" }, { href: "/support", label: "Support" }] }, { title: "Businesses", links: [{ href: "/match", label: "Get Matched" }] }];
export const teamLinks = [{ href: "/team/live", label: "Live Control" }, { href: "/admin", label: "Revenue" }];
export function NavBar() {
  const path = usePathname(); const [role, setRole] = useState<AppRole | null>(null); const [open, setOpen] = useState(false);
  useEffect(() => { if (!authConfigured) return; authClient().auth.getUser().then(async ({ data }) => setRole(data.user ? (await loadAuthProfile(data.user))?.role ?? null : null)); }, [path]);
  if (path === "/join" || path.startsWith("/support/") || path.startsWith("/demo") || !role) return null;
  const list = links[role];
  return <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md"><nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-8"><Link href={list[0][0]}><Wordmark /></Link><div className="hidden gap-5 lg:flex">{list.map(([href, label]) => <Link key={href} href={href} className={`text-sm font-medium ${path === href ? "text-ink" : "text-muted hover:text-ink"}`}>{label}</Link>)}</div><button className="btn btn-line mr-16 !py-2 text-sm lg:hidden" onClick={() => setOpen(!open)}>Menu</button></nav>{open && <div className="border-t border-line px-4 pb-5 lg:hidden">{list.map(([href, label]) => <Link key={href} href={href} className="block border-b border-line py-3 text-lg text-ink" onClick={() => setOpen(false)}>{label}</Link>)}</div>}</header>;
}
