import { NextResponse } from "next/server";
import { SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import { collectionId, getEvent, presignGet, rek } from "@/lib/aws";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REF = /^([a-f0-9]{12})-(\d{1,4})x(\d{1,4})\.(jpg|png)$/;
const THRESHOLD = Number(process.env.FACE_MATCH_THRESHOLD ?? 90);

// Public endpoint for guests. The selfie is read into memory, matched, and discarded: it is never written anywhere.
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const ev = await getEvent(params.slug);
  if (!ev) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const file = (await req.formData().catch(() => null))?.get("selfie");
  if (!(file instanceof File) || file.size > 5_000_000) return NextResponse.json({ error: "invalid" }, { status: 400 });

  let matches;
  try {
    const r = await rek.send(
      new SearchFacesByImageCommand({
        CollectionId: collectionId(ev.slug),
        Image: { Bytes: new Uint8Array(await file.arrayBuffer()) },
        FaceMatchThreshold: THRESHOLD,
        MaxFaces: 4096,
        QualityFilter: "AUTO",
      })
    );
    matches = r.FaceMatches ?? [];
  } catch (e: any) {
    if (e?.name === "InvalidParameterException") return NextResponse.json({ photos: [] }); // no usable face in the selfie
    console.error(e);
    return NextResponse.json({ error: "search_failed" }, { status: 500 });
  }

  const best = new Map<string, number>();
  for (const m of matches) {
    const ref = m.Face?.ExternalImageId;
    if (ref && REF.test(ref)) best.set(ref, Math.max(best.get(ref) ?? 0, m.Similarity ?? 0));
  }

  const photos = await Promise.all(
    [...best.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(async ([ref]) => {
        const [, id, w, h, ext] = REF.exec(ref)!;
        const filename = `rec-studio-${id}.${ext}`;
        const [thumbUrl, downloadUrl] = await Promise.all([
          presignGet(`events/${ev.slug}/thumbs/${id}-${w}x${h}.jpg`),
          presignGet(`events/${ev.slug}/originals/${ref}`, `attachment; filename="${filename}"`),
        ]);
        return { id, thumbUrl, downloadUrl, filename, width: Number(w), height: Number(h) };
      })
  );
  return NextResponse.json({ photos }, { headers: { "Cache-Control": "no-store" } });
}
