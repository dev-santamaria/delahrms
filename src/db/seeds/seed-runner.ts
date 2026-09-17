import { runDatabaseSeed } from "./run-seed";

runDatabaseSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
