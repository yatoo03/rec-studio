import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "@/lib/session";

// Everything under /admin requires a valid session cookie. API handlers re-check it (see lib/auth.ts).
export async function middleware(req: NextRequest) {
  if (!process.env.SESSION_SECRET) return new NextResponse("SESSION_SECRET is not configured", { status: 503 });
  if (await verifySession(req.cookies.get(COOKIE)?.value)) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/admin/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
