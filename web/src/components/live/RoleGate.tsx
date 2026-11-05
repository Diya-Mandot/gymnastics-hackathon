"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppRole, AuthProfile } from "@/lib/auth";
import { useAudience } from "@/components/AudienceProvider";

/** Pages for signed-in accounts of certain roles (fan rewards, business studio). Uses the site's one sign-in. */
export function RoleGate({ roles, children }: { roles: AppRole[]; children: React.ReactNode | ((p: AuthProfile) => React.ReactNode) }) {
  const { profile, ready } = useAudience();
  const pathname = usePathname();

  if (!ready) return <p className="p-8 text-muted">Loading your profile…</p>;
  if (!profile || !roles.includes(profile.role)) {
    const role = roles[0] === "staff" ? "staff" : roles[0];
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <p className="label">{profile ? "Not part of your account" : "Reward locked"}</p>
        <h1 className="mt-3 font-display text-6xl text-ink">Sign in to <em>claim it.</em></h1>
        <p className="mt-4 text-muted">
          {profile ? `This area is for ${roles.join(" and ")} accounts. You’re signed in as a ${profile.role}.` : "Create a free account or log in to open this."}
        </p>
        <Link href={`/join?next=${encodeURIComponent(pathname)}&role=${role}`} className="btn btn-red mt-7">Sign up or log in</Link>
      </div>
    );
  }
  return <>{typeof children === "function" ? children(profile) : children}</>;
}
