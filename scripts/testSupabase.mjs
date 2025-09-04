// scripts/testSupabase.mjs
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env.local explicitly (Next.js loads it for the app, but Node won't unless we do this)
const envPath = path.resolve(".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error("❌ .env.local not found at project root");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, anon, { auth: { persistSession: false } });

const { data, error } = await supabase
  .from("places")
  .select("id,name,city,state")
  .order("id", { ascending: true })
  .limit(5);

if (error) {
  console.error("❌ Supabase error:", error);
  process.exit(1);
}

console.log("✅ Supabase data:", data);

