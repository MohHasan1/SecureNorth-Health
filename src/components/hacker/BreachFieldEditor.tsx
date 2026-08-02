"use client";

import { useState } from "react";

import { breachWrite } from "@/lib/actions/breachWrite";
import type { EncryptedField } from "@/lib/crypto/encryption";

type PhiField = "patientName" | "dateOfBirth" | "diagnosisNotes";

const inputClass =
  "w-full bg-black border border-green-500/30 px-2 py-1 text-green-300 focus:border-green-400 focus:outline-none";

export function BreachFieldEditor({
  recordId,
  field,
  value,
}: {
  recordId: string;
  field: PhiField;
  value: EncryptedField;
}) {
  const [iv, setIv] = useState(value.iv);
  const [ciphertext, setCiphertext] = useState(value.ciphertext);
  const [authTag, setAuthTag] = useState(value.authTag);
  const [status, setStatus] = useState<"idle" | "writing" | "written">("idle");

  const dirty = iv !== value.iv || ciphertext !== value.ciphertext || authTag !== value.authTag;

  async function commit() {
    setStatus("writing");
    await breachWrite(recordId, field, { iv, ciphertext, authTag });
    setStatus("written");
  }

  return (
    <div className="mt-2">
      <div className="text-green-600">{field}:</div>
      <div className="pl-4 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-green-600">iv</span>
          <input className={inputClass} value={iv} onChange={(e) => setIv(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-green-600">ciphertext</span>
          <input
            className={inputClass}
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-green-600">authTag</span>
          <input
            className={inputClass}
            value={authTag}
            onChange={(e) => setAuthTag(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={commit}
            disabled={!dirty || status === "writing"}
            className="cursor-pointer border border-green-500/50 px-2 py-0.5 text-green-400 hover:bg-green-500/10 disabled:cursor-default disabled:opacity-40"
          >
            {status === "writing" ? "writing to db..." : "$ commit tampering"}
          </button>
          {status === "written" && !dirty ? (
            <span className="text-green-500">✓ written. Try reading it back through the app</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
