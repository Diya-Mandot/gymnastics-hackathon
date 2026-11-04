import { createMockSource } from "./mock";
import { createSupabaseSource } from "./supabase";
import type { LiveSource } from "./types";

let source: LiveSource | null = null;

// Supabase renamed "anon" keys to "publishable" keys; accept either name.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase when its URL and key are set, unless NEXT_PUBLIC_DATA_SOURCE=mock forces the offline mock. */
const useSupabase = process.env.NEXT_PUBLIC_DATA_SOURCE !== "mock" && Boolean(supabaseUrl && supabaseKey);

export function getLiveSource(): LiveSource {
  if (source) return source;
  source = useSupabase ? createSupabaseSource(supabaseUrl!, supabaseKey!) : createMockSource();
  return source;
}

export const isMockSource = () => !useSupabase;

export type { GiveInput, LiveEvent, LiveSource } from "./types";
