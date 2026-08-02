import config from "@payload-config";
import { getPayload } from "payload";

import { BreachFieldEditor } from "@/components/hacker/BreachFieldEditor";
import { decryptField, type EncryptedField } from "@/lib/crypto/encryption";

const PHI_FIELDS = ["patientName", "dateOfBirth", "diagnosisNotes"] as const;

// Demo-only label so whoever's recording can tell which record is which
// while editing ciphertext below. A real attacker doesn't have the key,
// so this line is the one thing on this page that isn't a faithful
// simulation of what they'd actually see.
function demoTrackingName(raw: EncryptedField): string {
  try {
    return decryptField(raw);
  } catch {
    return "(corrupted)";
  }
}

// This page reads live from the DB but never touches cookies/headers (it's
// intentionally unauthenticated), so Next.js has no signal to treat it as
// dynamic and would otherwise try to statically prerender it at build
// time, running a real DB query before the schema even exists yet.
export const dynamic = "force-dynamic";

export default async function BreachPage() {
  const payload = await getPayload({ config });

  // No user, no access control. This route intentionally bypasses the
  // app's auth entirely, the same way an attacker with direct storage
  // access would (the "cloud storage buckets... overly permissive access"
  // issue from the brief). context: { raw: true } means the PatientRecords
  // afterRead hook skips its own decrypt/redact logic and hands back
  // exactly what's sitting in the database.
  const { docs } = await payload.find({
    collection: "patient-records",
    overrideAccess: true,
    context: { raw: true },
    depth: 0,
    sort: "-createdAt",
    limit: 100,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-sm leading-relaxed">
      <pre className="whitespace-pre-wrap">
        {`root@attacker:~# mount //securenorth-backups/patient-db ./loot
root@attacker:~# sqlite3 loot/db.sqlite "SELECT * FROM patient_records;"
`}
      </pre>

      <p className="mt-4 text-green-500">
        [+] dumped {docs.length} row{docs.length === 1 ? "" : "s"} from
        patient_records. Fields are writable below, this is a live connection
        to the DB
      </p>

      <div className="mt-4 space-y-4">
        {docs.map((doc) => (
          <div key={doc.id} className="rounded border border-green-500/30 p-3">
            <div className="text-green-500">
              record_id = {doc.id}{" "}
              <span className="text-green-700">
                <span className="line-through decoration-2">
                  {demoTrackingName(doc.patientName as unknown as EncryptedField)}
                </span>{" "}
                (demo tracking only, a real attacker would not see this)
              </span>
            </div>
            {PHI_FIELDS.map((field) => (
              <BreachFieldEditor
                key={`${doc.id}-${field}-${(doc[field] as unknown as EncryptedField).ciphertext}`}
                recordId={String(doc.id)}
                field={field}
                value={doc[field] as unknown as EncryptedField}
              />
            ))}
          </div>
        ))}
      </div>

      <pre className="mt-6 whitespace-pre-wrap text-green-500">
        {`root@attacker:~# decrypt --input loot/db.sqlite --key ???
error: no key material found in dump
error: AES-256-GCM ciphertext is computationally infeasible to decrypt without it
[-] plaintext recovered: 0 / ${docs.length} records`}
      </pre>
      <p className="mt-4 text-green-600">
        Full read <span className="text-green-300">and write</span> access to
        the database. Edit any field above and commit it. You can corrupt the
        ciphertext, but you still can't read or produce valid plaintext without
        the key. Go check the record through the app afterward: it'll show a
        failed auth tag, not silently-wrong data.
        <span className="animate-pulse">_</span>
      </p>
    </div>
  );
}
