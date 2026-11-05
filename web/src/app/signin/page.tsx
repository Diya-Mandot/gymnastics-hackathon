import { redirect } from "next/navigation";

// One sign-in for the whole site: Supabase accounts at /join. Keep old /signin links working.
export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(await searchParams)) if (typeof v === "string") params.set(k, v);
  if (!params.has("mode")) params.set("mode", "login");
  redirect(`/join?${params.toString()}`);
}
