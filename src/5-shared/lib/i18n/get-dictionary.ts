import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const getGlobalDictionary = unstable_cache(
  async (locale: string): Promise<Record<string, string>> => {
    const { data, error } = await supabase
      .from("global_translations")
      .select("key, value")
      .eq("locale", locale);
    if (error) throw error;
    const dict: Record<string, string> = {};
    for (const row of data ?? []) {
      dict[row.key] = row.value;
    }
    return dict;
  },
  ["global_dictionary"],
  { revalidate: 60 * 60 } // 1 hour
);
