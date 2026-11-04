import { createMockSource } from "./mock";
import { createSupabaseSource } from "./supabase";
import type { LiveSource } from "./types";

let source: LiveSource | null = null;

export function getLiveSource(): LiveSource {
  if (source) return source;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  source =
    process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" && url && key
      ? createSupabaseSource(url, key)
      : createMockSource();
  return source;
}

export const isMockSource = () => process.env.NEXT_PUBLIC_DATA_SOURCE !== "supabase";

export type { GiveInput, LiveEvent, LiveSource } from "./types";
