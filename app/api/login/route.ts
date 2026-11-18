import { NextResponse } from "next/server";
import { checkLogin } from "@/lib/users";
import { COOKIE, signSession } from "@/lib/session";

export const runtime = "nodejs";

// Best-effort brute-force guard (per server instance): 10 failures per 15 minutes per IP.
const attempts = new Map<string, { n: number; t: number }>();
const WINDOW = 15 * 60_000;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const a = attempts.get(ip);
  const fresh = a && Date.now() - a.t < WINDOW ? a : undefined;
  if (fresh && fresh.n >= 10) return NextResponse.json({ error: "too_many" }, { status: 429 });

  const b = await req.json().catch(() => null);
  try {
    const user = await checkLogin(String(b?.username ?? ""), String(b?.password ?? ""));
    if (!user) {
      attempts.set(ip, { n: (fresh?.n ?? 0) + 1, t: fresh?.t ?? Date.now() });
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }
    attempts.delete(ip);
    const res = NextResponse.json({ ok: true, role: user.r });
    res.cookies.set(COOKIE, await signSession(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 86400,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
