/* Resolve the signed-in user for a route handler, or null. */
import { getSessionUserId } from "./session";
import { getUserById } from "@/lib/db/repo";
import type { User } from "@/lib/data/types";

export async function currentUser(): Promise<User | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  try {
    return await getUserById(id);
  } catch {
    return null;
  }
}
