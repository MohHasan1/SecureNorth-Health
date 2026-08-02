import type { DecryptResult } from "@/components/portal/BehindTheScenesPanel";

// Turns a field's decrypt-hook result into ordinary display text — shared
// by the patient record view and the records list search, so both read
// the same fallback wording for restricted/tampered fields.
export function decryptResultText(result: DecryptResult, fallback = "—") {
  if (result.restricted) return "Restricted";
  if ("tampered" in result) return "⚠ Unverifiable";
  return result.plaintext || fallback;
}
