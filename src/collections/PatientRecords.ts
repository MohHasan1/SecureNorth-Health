import type { CollectionConfig, FieldHook } from "payload";

import {
  decryptField,
  encryptField,
  type EncryptedField,
} from "@/lib/crypto/encryption";

// Roles that can decrypt PHI on ANY patient record, not just ones they
// submitted — providers need full patient context to treat someone they
// didn't personally admit, and admin needs it for the tamper demo.
const BROAD_ACCESS_ROLES = new Set(["provider", "admin"]);

function isEncryptedField(value: unknown): value is EncryptedField {
  return (
    typeof value === "object" &&
    value !== null &&
    "iv" in value &&
    "ciphertext" in value &&
    "authTag" in value
  );
}

// Runs on every create/update. Encrypts plain-text input coming from the
// intake form before it ever reaches the database — this is "at rest."
// If the value is already an EncryptedField (unchanged on this save, or a
// deliberately corrupted blob from the tamper demo) it's passed through
// untouched instead of being re-encrypted.
const encryptOnChange: FieldHook = ({ value }) => {
  if (value === undefined || value === null || value === "") return value;
  if (isEncryptedField(value)) return value;
  return encryptField(String(value));
};

// Runs on every read. `context.raw` is set by the tamper-demo endpoint to
// fetch the untouched ciphertext blob directly — everyone else gets either
// the decrypted plaintext or a redacted placeholder, depending on role:
// provider/admin can decrypt any record, a nurse can only decrypt the
// records she personally submitted.
const decryptForAuthorizedRoles: FieldHook = ({ value, req, context, data }) => {
  if (context?.raw) return value;
  if (!isEncryptedField(value)) return value;

  const role = req.user?.role;
  const submittedBy = data?.submittedBy;
  const submittedById =
    typeof submittedBy === "object" && submittedBy !== null
      ? (submittedBy as { id: unknown }).id
      : submittedBy;
  const isOwnRecord = Boolean(req.user) && submittedById === req.user?.id;

  const canDecrypt =
    (role && BROAD_ACCESS_ROLES.has(role)) || (role === "nurse" && isOwnRecord);

  if (!canDecrypt) {
    return { restricted: true };
  }

  try {
    return { restricted: false, plaintext: decryptField(value) };
  } catch {
    // GCM auth tag verification failed — the ciphertext was modified
    // after encryption. This is what the tamper-demo button proves live.
    return { restricted: false, tampered: true };
  }
};

const phiField = (name: string, label: string) => ({
  name,
  type: "json" as const,
  label,
  required: true,
  hooks: {
    beforeChange: [encryptOnChange],
    afterRead: [decryptForAuthorizedRoles],
  },
});

export const PatientRecords: CollectionConfig = {
  slug: "patient-records",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["id", "submittedBy", "createdAt"],
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === "provider" || user.role === "admin") return true;
      // Nurses can see the records they submitted (still redacted PHI —
      // decrypt authorization is separate, see decryptForAuthorizedRoles).
      return { submittedBy: { equals: user.id } };
    },
    // Only an admin may edit or delete a record from the normal portal.
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    phiField("patientName", "Patient Name"),
    phiField("dateOfBirth", "Date of Birth"),
    phiField("diagnosisNotes", "Diagnosis Notes"),
    {
      name: "submittedBy",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === "create" && req.user) {
          data.submittedBy = req.user.id;
        }
        return data;
      },
    ],
    // deleteByID formats its response by running this same collection's
    // afterRead hooks on the doc it just deleted — without this flag, the
    // audit-log hook below would try to insert a log row pointing at a
    // record ID that no longer exists in the DB, failing the delete with
    // a foreign-key error even though the delete itself already succeeded.
    beforeDelete: [
      ({ context }) => {
        context.isDeleting = true;
      },
    ],
    afterRead: [
      async ({ doc, req, context }) => {
        // One audit-log entry per document read, not per field.
        // overrideAccess: this write is system-triggered by the read
        // itself, not a user action, so it shouldn't be gated by the
        // reading user's own collection permissions.
        if (!context?.raw && !context?.isDeleting && req.user) {
          await req.payload.create({
            collection: "access-logs",
            data: {
              user: req.user.id,
              record: doc.id,
              action: "read",
            },
            overrideAccess: true,
          });
        }
        return doc;
      },
    ],
  },
};
