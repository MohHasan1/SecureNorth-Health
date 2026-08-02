import { redirect } from "next/navigation";

import { AddRandomRecordButton } from "@/components/portal/AddRandomRecordButton";
import { SeedRunner } from "@/components/portal/SeedRunner";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function SeedPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/records");

  return (
    <div className="mx-auto max-w-md space-y-10">
      <div>
        <h1 className="text-xl font-semibold">Seed demo data</h1>
        <p className="mt-1 text-sm text-muted">
          Creates the 4 demo accounts and 2 sample patient records if they don't already exist —
          same logic as <code className="rounded bg-restricted-bg px-1 py-0.5 text-xs">pnpm seed</code>,
          just runnable from here against whatever database this deployment is actually using.
          Safe to click more than once.
        </p>
        <div className="mt-6">
          <SeedRunner />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Add more test data</h2>
        <p className="mt-1 text-sm text-muted">
          Creates one additional patient record with randomized details, attributed to a random
          existing nurse. Useful for padding out the records list beyond the two fixed seed
          records.
        </p>
        <div className="mt-4">
          <AddRandomRecordButton />
        </div>
      </div>
    </div>
  );
}
