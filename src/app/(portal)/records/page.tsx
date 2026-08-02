import config from "@payload-config";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function RecordsListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const payload = await getPayload({ config });

  // A nurse's access rule scopes this to records they submitted; a
  // provider/admin's rule allows all — same access control as everywhere
  // else, just applied to a list instead of a single document.
  const { docs } = await payload.find({
    collection: "patient-records",
    user,
    overrideAccess: false,
    depth: 0,
    sort: "-createdAt",
    limit: 50,
  });

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

      {docs.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No records yet. Submit one from &quot;New record&quot;.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-surface">
          {docs.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/records/${doc.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-bg"
              >
                <span>Record #{doc.id}</span>
                <span className="text-muted">
                  {new Date(doc.createdAt).toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
