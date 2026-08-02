import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM: authenticated encryption. Unlike CBC, GCM produces an auth
// tag that detects any bit-flip in the ciphertext at decrypt time — that
// property is what the tamper-detection demo relies on.
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12; // 96-bit IV is the NIST-recommended size for GCM

export type EncryptedField = {
  iv: string; // base64
  ciphertext: string; // base64
  authTag: string; // base64
};

function getKey(): Buffer {
  const base64Key = process.env.PATIENT_FIELD_ENCRYPTION_KEY;
  if (!base64Key) {
    throw new Error("PATIENT_FIELD_ENCRYPTION_KEY is not set");
  }
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32) {
    throw new Error(
      "PATIENT_FIELD_ENCRYPTION_KEY must decode to exactly 32 bytes (AES-256)",
    );
  }
  return key;
}

export function encryptField(plaintext: string): EncryptedField {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

// Throws if the auth tag doesn't match — this is GCM detecting that the
// ciphertext (or tag) was modified after encryption, e.g. by an attacker
// or by data corruption. That thrown error is what the tamper demo shows.
export function decryptField(field: EncryptedField): string {
  const key = getKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(field.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(field.authTag, "base64"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(field.ciphertext, "base64")),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}
