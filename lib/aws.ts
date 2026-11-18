import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { EventRec } from "./events";

// Custom REC_AWS_* names: Vercel injects its own AWS_* values at runtime, which can break the SDK.
// Falls back to the standard AWS_* names for local use.
const region = process.env.REC_AWS_REGION ?? process.env.AWS_REGION;
const credentials =
  process.env.REC_AWS_ACCESS_KEY_ID && process.env.REC_AWS_SECRET_ACCESS_KEY
    ? { accessKeyId: process.env.REC_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.REC_AWS_SECRET_ACCESS_KEY }
    : undefined;
export const BUCKET = process.env.S3_BUCKET!;

// WHEN_REQUIRED keeps checksum params out of presigned PUT URLs (they break browser uploads).
export const s3 = new S3Client({ region, credentials, requestChecksumCalculation: "WHEN_REQUIRED" });
export const rek = new RekognitionClient({ region, credentials });

export const collectionId = (slug: string) => `rec-${slug}`;
const SLUG = /^[a-z2-9]{8}$/;

export const presignPut = (key: string, contentType: string) =>
  getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }), { expiresIn: 900 });

export const presignGet = (key: string, disposition?: string) =>
  getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key, ResponseContentDisposition: disposition }), { expiresIn: 3600 });

// Events are small JSON files in S3 (events/<slug>/event.json), so no database is needed.
export async function getEvent(slug: string): Promise<EventRec | null> {
  if (!SLUG.test(slug)) return null;
  try {
    const r = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: `events/${slug}/event.json` }));
    return JSON.parse((await r.Body!.transformToString()) as string);
  } catch (e: any) {
    if (e?.name === "NoSuchKey") return null;
    throw e;
  }
}

export const saveEvent = (ev: EventRec) =>
  s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: `events/${ev.slug}/event.json`, Body: JSON.stringify(ev), ContentType: "application/json" }));

export async function listEvents(): Promise<EventRec[]> {
  const r = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: "events/", Delimiter: "/" }));
  const slugs = (r.CommonPrefixes ?? []).map((p) => p.Prefix!.split("/")[1]);
  const all = await Promise.all(slugs.map(getEvent));
  return all.filter((e): e is EventRec => !!e).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}
