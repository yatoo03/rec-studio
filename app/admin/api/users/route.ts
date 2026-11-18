import { NextResponse } from "next/server";
import { forgetUsersCache, requireSession } from "@/lib/auth";
import { addUser, listUsers } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireSession("owner"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const users = (await listUsers()).map(({ username, createdAt }) => ({ username, createdAt }));
  return NextResponse.json({ owner: process.env.ADMIN_USER?.toLowerCase() ?? "", users });
}

export async function POST(req: Request) {
  if (!(await requireSession("owner"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const username = String(b?.username ?? "").trim().toLowerCase();
  const password = String(b?.password ?? "");
  if (!/^[a-z0-9._-]{3,32}$/.test(username) || password.length < 8 || password.length > 128)
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (!(await addUser(username, password))) return NextResponse.json({ error: "exists" }, { status: 409 });
  forgetUsersCache();
  return NextResponse.json({ ok: true }, { status: 201 });
}
