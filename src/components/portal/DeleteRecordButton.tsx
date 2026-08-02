"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteRecordButton({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("Delete this patient record? This can't be undone.")) return;

    setLoading(true);
    // Same real REST endpoint the rest of the app uses — Payload's own
    // collection access control (admin-only for update/delete) is what's
    // actually enforcing this, not anything client-side.
    await fetch(`/api/patient-records/${recordId}`, { method: "DELETE" });
    router.push("/records");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-md border border-danger-border bg-surface px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger-bg disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete record"}
    </button>
  );
}
