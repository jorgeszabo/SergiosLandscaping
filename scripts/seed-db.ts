/* ---------------------------------------------------------------------------
   Manual database initializer. The app also auto-initializes on first request,
   so running this is optional — it's handy for provisioning a database ahead of
   time from a machine that has DATABASE_URL.

   Usage:  DATABASE_URL=postgres://… npm run db:seed
   --------------------------------------------------------------------------- */
import { isDbConfigured } from "../src/lib/db/client";
import { ensureInitialized, DEFAULT_PASSWORD } from "../src/lib/db/init";
import { listUsersSafe, getCatalog, listCustomers } from "../src/lib/db/repo";

async function main() {
  if (!isDbConfigured()) {
    console.error("No DATABASE_URL set. Nothing to do.");
    process.exit(1);
  }
  console.log("Initializing schema and seeding starter data…");
  await ensureInitialized();

  const [users, catalog, customers] = await Promise.all([
    listUsersSafe(),
    getCatalog(),
    listCustomers(),
  ]);
  console.log(`✓ users:      ${users.map((u) => u.id).join(", ")}`);
  console.log(`✓ catalog:    ${catalog.parts.length} parts, ${catalog.labor.length} labor, ${catalog.issues.length} issues, ${catalog.assemblies.length} assemblies`);
  console.log(`✓ customers:  ${customers.length}`);
  console.log(`\nEvery seeded account's password is: ${DEFAULT_PASSWORD}`);
  console.log("Change it per user after go-live.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
