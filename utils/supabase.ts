import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not configured");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Note {
  id: string;
  path: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StateEntry {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}
