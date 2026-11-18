import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { CreateCollectionCommand } from "@aws-sdk/client-rekognition";
import { collectionId, listEvents, rek, saveEvent } from "@/lib/aws";
import { newSlug, type EventRec } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await listEvents());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "list_failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? "").trim().slice(0, 120);
  const client = String(b?.client ?? "").trim().slice(0, 120);
  const date = String(b?.date ?? "");
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const slug = newSlug();
  try {
    await rek.send(new CreateCollectionCommand({ CollectionId: collectionId(slug) })); // one face collection per event
    const ev: EventRec = { id: slug, slug, name, client, date, createdAt: new Date().toISOString() };
    await saveEvent(ev);
    return NextResponse.json(ev, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
