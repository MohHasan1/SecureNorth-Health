import { getPayload } from "payload";

import config from "./payload.config";

const DEMO_USERS = [
  {
    email: "nurse@securenorth.health",
    password: "nurse-demo-pass",
    name: "Amara Okafor",
    role: "nurse",
  },
  {
    // A second nurse — needed to demo that a nurse can decrypt records she
    // submitted, but not another nurse's patients.
    email: "nurse2@securenorth.health",
    password: "nurse2-demo-pass",
    name: "Ben Torres",
    role: "nurse",
  },
  {
    email: "provider@securenorth.health",
    password: "provider-demo-pass",
    name: "Dr. Priya Sharma",
    role: "provider",
  },
  {
    email: "admin@securenorth.health",
    password: "admin-demo-pass",
    name: "IT Admin",
    role: "admin",
  },
] as const;

async function seed() {
  const payload = await getPayload({ config });

  for (const user of DEMO_USERS) {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: user.email } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      console.log(`Skipping ${user.email} — already exists`);
      continue;
    }

    await payload.create({
      collection: "users",
      data: user,
      overrideAccess: true,
    });
    console.log(`Created ${user.role}: ${user.email} / ${user.password}`);
  }

  process.exit(0);
}

seed();
