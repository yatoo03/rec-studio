import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getEvent, presignPut } from "@/lib/aws";

export const runtime = "nodejs";

// Returns presigned URLs so the browser uploads straight to S3 (original + thumbnail).
// The photo's "ref" encodes id, thumbnail size and extension: <id>-<w>x<h>.<ext>
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ev = await getEvent(params.slug);
  if (!ev) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const b = await req.json().catch(() => null);
  const type = b?.contentType;
  const ext = type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : null;
  const w = Math.round(Number(b?.width));
  const h = Math.round(Number(b?.height));
  if (!ext || !(w > 0 && w <= 5000) || !(h > 0 && h <= 5000)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const base = `${randomBytes(6).toString("hex")}-${w}x${h}`;
  const ref = `${base}.${ext}`;
  const [originalUrl, thumbUrl] = await Promise.all([
    presignPut(`events/${ev.slug}/originals/${ref}`, type),
    presignPut(`events/${ev.slug}/thumbs/${base}.jpg`, "image/jpeg"),
  ]);
  return NextResponse.json({ ref, originalUrl, thumbUrl });
}
