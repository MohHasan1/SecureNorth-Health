"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function IntakeForm() {
  const router = useRouter();
  const [patientName, setPatientName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // This is the real network boundary to inspect for the "in transit"
    // part of the demo: a plaintext JSON body, sent to Payload's own
    // REST endpoint, that only turns into ciphertext once it reaches the
    // beforeChange field hook on the server.
    const res = await fetch("/api/patient-records?depth=0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName, dateOfBirth, diagnosisNotes }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not submit record. Are you signed in?");
      return;
    }

    const { doc } = await res.json();
    router.push(`/records/${doc.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="patientName" className="block text-sm font-medium text-foreground">
          Patient name
        </label>
        <input
          id="patientName"
          required
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground">
          Date of birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          required
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="diagnosisNotes" className="block text-sm font-medium text-foreground">
          Diagnosis notes
        </label>
        <textarea
          id="diagnosisNotes"
          required
          rows={4}
          value={diagnosisNotes}
          onChange={(e) => setDiagnosisNotes(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-default disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit patient record"}
      </button>
    </form>
  );
}
