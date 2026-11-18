import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { IndexFacesCommand } from "@aws-sdk/client-rekognition";
import { BUCKET, collectionId, getEvent, rek } from "@/lib/aws";

export const runtime = "nodejs";

const REF = /^[a-f0-9]{12}-\d{1,4}x\d{1,4}\.(jpg|png)$/;

// Called after the browser finished uploading: adds every face in the photo to the event's collection.
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ev = await getEvent(params.slug);
  if (!ev) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const b = await req.json().catch(() => null);
  const ref = String(b?.ref ?? "");
  if (!REF.test(ref)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const r = await rek.send(
      new IndexFacesCommand({
        CollectionId: collectionId(ev.slug),
        Image: { S3Object: { Bucket: BUCKET, Name: `events/${ev.slug}/originals/${ref}` } },
        ExternalImageId: ref,
        MaxFaces: 100,
        QualityFilter: "AUTO",
      })
    );
    return NextResponse.json({ faces: r.FaceRecords?.length ?? 0 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "index_failed" }, { status: 500 });
  }
}
