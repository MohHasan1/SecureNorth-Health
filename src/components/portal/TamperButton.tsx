"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { tamperWithRecord } from "@/lib/actions/tamperWithRecord";

export function TamperButton({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await tamperWithRecord(recordId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-md border border-danger-border bg-surface px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger-bg disabled:opacity-50"
    >
      {loading ? "Tampering…" : "⚠ Simulate ciphertext tampering (attacker)"}
    </button>
  );
}
