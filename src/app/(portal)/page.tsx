import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function PortalRootPage() {
  const user = await getCurrentUser();
  redirect(user ? "/records" : "/login");
}
