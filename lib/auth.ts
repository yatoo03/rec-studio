import { cookies } from "next/headers";
import { COOKIE, verifySession, type Session } from "./session";
import { listUsers } from "./users";

let cache: { at: number; names: Set<string> } | null = null;
async function staffExists(name: string) {
  if (!cache || Date.now() - cache.at > 30_000) {
    cache = { at: Date.now(), names: new Set((await listUsers()).map((u) => u.username)) };
  }
  return cache.names.has(name);
}
export const forgetUsersCache = () => { cache = null; };

// Call at the top of every /admin/api handler. A deleted staff member loses access within ~30 seconds.
export async function requireSession(role?: "owner"): Promise<Session | null> {
  const s = await verifySession(cookies().get(COOKIE)?.value);
  if (!s) return null;
  if (role === "owner" && s.r !== "owner") return null;
  if (s.r === "staff" && !(await staffExists(s.u))) return null;
  return s;
}
