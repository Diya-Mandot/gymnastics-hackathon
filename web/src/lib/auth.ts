// Roles on the site. Sign-in is the quick, no-password sign-up at /join (see AudienceProvider);
// there are no Supabase accounts.

export type AppRole = "fan" | "business" | "athlete" | "staff";
export type AuthProfile = { id: string; email: string; firstName: string; role: AppRole };

/** Where each kind of person lands after signing in. */
export const homeForRole = (role: AppRole) =>
  role === "staff" ? "/team/live" : role === "business" ? "/business" : role === "athlete" ? "/portal/avery" : "/fan";
