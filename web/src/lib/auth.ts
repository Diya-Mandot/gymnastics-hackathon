"use client";
import { createClient, type User } from "@supabase/supabase-js";

export type AppRole = "fan" | "business" | "athlete" | "staff";
export type AuthProfile = { id: string; email: string; firstName: string; role: AppRole };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let client: ReturnType<typeof createClient> | null = null;
export const authConfigured = Boolean(url && key);
export function authClient() { if (!url || !key) throw new Error("Supabase Auth is not configured."); return client ??= createClient(url, key); }
export async function loadAuthProfile(user: User): Promise<AuthProfile | null> {
  const { data } = await authClient().from("profiles").select("id,email,first_name,role").eq("id", user.id).maybeSingle();
  if (!data) return null;
  return { id: data.id, email: data.email, firstName: data.first_name, role: data.role as AppRole };
}
