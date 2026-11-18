import { NextResponse } from "next/server";
import { forgetUsersCache, requireSession } from "@/lib/auth";
import { removeUser } from "@/lib/users";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: { username: string } }) {
  if (!(await requireSession("owner"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await removeUser(params.username.toLowerCase()))) return NextResponse.json({ error: "not_found" }, { status: 404 });
  forgetUsersCache();
  return NextResponse.json({ ok: true });
}
