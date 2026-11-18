// Signed session cookie (HMAC-SHA256). Uses Web Crypto, so it runs in both middleware (edge) and Node routes.
export type Session = { u: string; r: "owner" | "staff"; exp: number };
export const COOKIE = "rec_session";

const enc = new TextEncoder();
const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(s: Pick<Session, "u" | "r">, days = 7) {
  const payload: Session = { ...s, exp: Math.floor(Date.now() / 1000) + days * 86400 };
  const body = b64(enc.encode(JSON.stringify(payload)));
  return `${body}.${b64(await crypto.subtle.sign("HMAC", await key(), enc.encode(body)))}`;
}

export async function verifySession(token?: string): Promise<Session | null> {
  const [body, sig] = (token ?? "").split(".");
  if (!body || !sig) return null;
  try {
    if (!(await crypto.subtle.verify("HMAC", await key(), unb64(sig), enc.encode(body)))) return null;
    const p = JSON.parse(new TextDecoder().decode(unb64(body))) as Session;
    return p.exp > Date.now() / 1000 ? p : null;
  } catch {
    return null;
  }
}
