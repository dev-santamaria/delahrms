// Script to apply RLS policies to the Supabase database
// Run with: node src/db/apply-rls.mjs

import { readFileSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local manually
const envPath = resolve(__dirname, "../../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^"(.*)"$/, "$1");
  process.env[key] = val;
}

const require = createRequire(import.meta.url);
const postgres = require("postgres");

const sql = postgres(process.env.DIRECT_URL, {
  ssl: "require",
  max: 1,
});

const rlsSQL = readFileSync(resolve(__dirname, "rls-policies.sql"), "utf-8");

console.log("\n🔐 Applying RLS policies as a single transaction...\n");

try {
  // Execute the entire file in one shot — preserves dollar-quoting
  await sql.unsafe(rlsSQL);
  console.log("✅ All RLS policies applied successfully!\n");
} catch (err) {
  console.error("❌ Error applying RLS policies:");
  console.error(err.message);
  console.error("\nHint: Check if the policy already exists (duplicate policy names).");
  process.exit(1);
} finally {
  await sql.end();
}

process.exit(0);
