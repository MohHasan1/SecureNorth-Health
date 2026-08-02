"use server";

import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

import { seedDemoData } from "@/lib/seedDemoData";

// Admin-only. This is what lets you seed a deployed production database
// (Mongo) without a terminal or SSH access to wherever it's actually
// hosted.
export async function runSeed(): Promise<string[]> {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (user?.role !== "admin") {
    throw new Error("Only an admin can run the seed.");
  }

  return seedDemoData(payload);
}
