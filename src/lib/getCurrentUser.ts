import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

// Reads the same auth cookie Payload's own REST endpoints set on
// /api/users/login. Server components stay in sync with the portal's
// login state for free, no custom session handling needed.
export async function getCurrentUser() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });
  return user;
}
