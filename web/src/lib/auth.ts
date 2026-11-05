"use client";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

export type AppRole = "fan" | "business" | "athlete" | "staff";
export type AuthProfile = { id: string; email: string; firstName: string; role: AppRole };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Untyped schema (no generated DB types), so inserts and selects on any table type-check.
let client: SupabaseClient | null = null;
export const authConfigured = Boolean(url && key);
export function authClient() { if (!url || !key) throw new Error("Supabase Auth is not configured."); return client ??= createClient(url, key); }
export async function loadAuthProfile(user: User): Promise<AuthProfile | null> {
  const { data } = await authClient().from("profiles").select("id,email,first_name,role").eq("id", user.id).maybeSingle();
  const profile = data as unknown as { id: string; email: string; first_name: string; role: AppRole } | null;
  if (!profile) return null;
  return { id: profile.id, email: profile.email, firstName: profile.first_name, role: profile.role };
}
