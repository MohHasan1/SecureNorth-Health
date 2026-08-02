import type { EncryptedField } from "@/lib/crypto/encryption";

export type DecryptResult =
  | { restricted: true }
  | { restricted: false; tampered: true }
  | { restricted: false; plaintext: string };

type RawFields = {
  patientName: EncryptedField;
  dateOfBirth: EncryptedField;
  diagnosisNotes: EncryptedField;
};

type DecryptedFields = {
  patientName: DecryptResult;
  dateOfBirth: DecryptResult;
  diagnosisNotes: DecryptResult;
};

const FIELD_LABELS: Record<keyof RawFields, string> = {
  patientName: "Patient name",
  dateOfBirth: "Date of birth",
  diagnosisNotes: "Diagnosis notes",
};

function truncate(value: string, length = 28) {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

function DecryptedValue({ result }: { result: DecryptResult }) {
  if (result.restricted) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-restricted-bg px-2 py-0.5 text-xs font-medium text-restricted">
        🔒 Restricted — you don't have clearance for this record
      </span>
    );
  }
  if ("tampered" in result) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-danger-bg px-2 py-0.5 text-xs font-medium text-danger">
        ⚠ Auth tag verification failed — ciphertext was modified
      </span>
    );
  }
  return <span className="text-sm text-foreground">{result.plaintext}</span>;
}

export function BehindTheScenesPanel({
  recordId,
  raw,
  decrypted,
}: {
  recordId: string;
  raw: RawFields;
  decrypted: DecryptedFields;
}) {
  const fields = Object.keys(FIELD_LABELS) as (keyof RawFields)[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Record #{recordId}</h1>
        <p className="mt-1 text-sm text-muted">
          What happened to this record after you hit submit.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-medium">1. In transit</h2>
        <p className="mt-1 text-sm text-muted">
          The intake form sent this data as plain JSON to{" "}
          <code className="rounded bg-restricted-bg px-1 py-0.5 text-xs">
            POST /api/patient-records
          </code>{" "}
          over HTTPS. Open DevTools → Network (or the public tunnel URL from DEMO.md) to inspect
          the request — TLS is what makes it unreadable on the wire, not this app.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-medium">2. At rest (as stored in db.sqlite)</h2>
        <p className="mt-1 text-sm text-muted">
          Every field below is AES-256-GCM ciphertext. This is safe to display — without the
          key, it's meaningless.
        </p>
        <div className="mt-3 space-y-3 overflow-x-auto">
          {fields.map((field) => (
            <div key={field} className="rounded border border-border p-3 text-xs">
              <div className="font-medium text-foreground">{FIELD_LABELS[field]}</div>
              <dl className="mt-1 grid grid-cols-[5rem_1fr] gap-x-2 gap-y-0.5 font-mono text-muted">
                <dt>iv</dt>
                <dd>{truncate(raw[field].iv)}</dd>
                <dt>ciphertext</dt>
                <dd>{truncate(raw[field].ciphertext)}</dd>
                <dt>authTag</dt>
                <dd>{truncate(raw[field].authTag)}</dd>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-medium">3. Decrypted on read (access-controlled)</h2>
        <p className="mt-1 text-sm text-muted">
          What you see below depends on your role — this is the least-privilege fix for
          SecureNorth's stale access policies.
        </p>
        <div className="mt-3 space-y-3">
          {fields.map((field) => (
            <div key={field} className="rounded border border-border p-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-foreground">{FIELD_LABELS[field]}</span>
                <DecryptedValue result={decrypted[field]} />
              </div>
              {/* The literal return value of the afterRead field hook —
                  not just the friendly badge above it. */}
              <pre className="mt-2 overflow-x-auto rounded bg-restricted-bg px-2 py-1 font-mono text-[11px] text-muted">
                {JSON.stringify(decrypted[field])}
              </pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
