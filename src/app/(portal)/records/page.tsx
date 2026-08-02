import config from "@payload-config";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import type { DecryptResult } from "@/components/portal/BehindTheScenesPanel";
import { RecordsSearch } from "@/components/portal/RecordsSearch";
import { decryptResultText } from "@/lib/decryptResultText";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function RecordsListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const payload = await getPayload({ config });

  // A nurse's access rule scopes this to records they submitted. A
  // doctor/admin's rule allows all, same access control as everywhere
  // else, just applied to a list instead of a single document. Every row
  // returned here is one this viewer is also allowed to decrypt (nurses
  // only ever see their own patients, who they can always decrypt, and a
  // doctor/admin can decrypt anything), so patient names render for
  // real instead of showing anonymous record IDs.
  const { docs } = await payload.find({
    collection: "patient-records",
    user,
    overrideAccess: false,
    depth: 0,
    sort: "-createdAt",
    limit: 50,
  });

  const rows = docs.map((doc) => ({
    id: String(doc.id),
    patientName: decryptResultText(doc.patientName as unknown as DecryptResult, "Unknown"),
    dateOfBirth: decryptResultText(doc.dateOfBirth as unknown as DecryptResult, "N/A"),
    createdAt: doc.createdAt,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Patient records</h1>
        <Link
          href="/intake"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          + New record
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No records yet. Submit one from &quot;New record&quot;.
        </p>
      ) : (
        <div className="mt-6">
          <RecordsSearch rows={rows} />
        </div>
      )}
    </div>
  );
}
