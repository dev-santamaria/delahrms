import fs from "fs";
import path from "path";

const schemaDir = path.join(process.cwd(), "src/db/schema");
const routersDir = path.join(process.cwd(), "src/server/api/routers");

const schemaFiles = fs.readdirSync(schemaDir).filter(f => f.endsWith(".ts") && f !== "index.ts" && f !== "relations.ts");
const routerFiles = fs.readdirSync(routersDir).filter(f => f.endsWith(".ts"));

let allRouterCode = "";
for (const rf of routerFiles) {
  allRouterCode += fs.readFileSync(path.join(routersDir, rf), "utf8") + "\n";
}

const unreferencedTables: { file: string; table: string }[] = [];
const referencedTables: { file: string; table: string }[] = [];

for (const sf of schemaFiles) {
  const content = fs.readFileSync(path.join(schemaDir, sf), "utf8");
  const tableMatches = [...content.matchAll(/export const (\w+) = pgTable\(/g)].map(m => m[1]);
  for (const tbl of tableMatches) {
    // Regex for word boundary so it's accurate
    const regex = new RegExp(`\\b${tbl}\\b`);
    if (regex.test(allRouterCode)) {
      referencedTables.push({ file: sf, table: tbl });
    } else {
      unreferencedTables.push({ file: sf, table: tbl });
    }
  }
}

console.log(`TOTAL TABLES AUDITED: ${referencedTables.length + unreferencedTables.length}`);
console.log(`REFERENCED / WIRED TABLES: ${referencedTables.length}`);
console.log(`UNREFERENCED / NOT WIRED TABLES: ${unreferencedTables.length}\n`);

if (unreferencedTables.length > 0) {
  console.log("=== UNREFERENCED TABLES BREAKDOWN ===");
  const grouped: Record<string, string[]> = {};
  for (const u of unreferencedTables) {
    if (!grouped[u.file]) grouped[u.file] = [];
    grouped[u.file].push(u.table);
  }
  for (const [file, tables] of Object.entries(grouped)) {
    console.log(`\n[${file}] (${tables.length} tables):`);
    for (const t of tables) {
      console.log(`  - ${t}`);
    }
  }
}
