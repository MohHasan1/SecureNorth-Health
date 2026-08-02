// CLI entry point for seeding. The actual seeding logic lives in
// src/lib/seedDemoData.ts, shared with the in-app admin "Seed demo data"
// page (src/app/(portal)/admin-tools/seed) for deployed environments where
// there's no terminal to run this script against. Usage:
//
//   pnpm seed         local dev, seeds db.sqlite
//   pnpm seed:prod    NODE_ENV=production, seeds whatever DATABASE_URI in
//                     .env.production points at (a real MongoDB instance)
import { getPayload } from "payload";

import config from "./payload.config";
import { seedDemoData } from "./lib/seedDemoData";

async function main() {
  const payload = await getPayload({ config });
  const log = await seedDemoData(payload);
  log.forEach((line) => console.log(line));
  process.exit(0);
}

main();
