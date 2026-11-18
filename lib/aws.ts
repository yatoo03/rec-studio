import type { EventRec } from "./events";

// مصفوفة مؤقتة في الذاكرة لتخزين الفعاليات محلياً بدون الحاجة لأمازون S3
let localEvents: EventRec[] = [];

export const collectionId = (slug: string) => `rec-${slug}`;
const SLUG = /^[a-z2-9]{8}$/;

export const presignPut = async (key: string, contentType: string) => {
  return `https://placeholder.storage/upload/${key}`;
};

export const presignGet = async (key: string, disposition?: string) => {
  return `https://placeholder.storage/file/${key}`;
};

// جلب الفعالية محلياً
export async function getEvent(slug: string): Promise<EventRec | null> {
  if (!SLUG.test(slug) && slug !== "demo") return null;
  const event = localEvents.find((e) => e.slug === slug);
  return event || {
    slug,
    title: "فعالية تجريبية",
    client: "REC. STUDIO",
    createdAt: new Date().toISOString(),
  };
}

// حفظ الفعالية محلياً بدون S3
export async function saveEvent(ev: EventRec): Promise<void> {
  const index = localEvents.findIndex((e) => e.slug === ev.slug);
  if (index >= 0) {
    localEvents[index] = ev;
  } else {
    localEvents.push(ev);
  }
}

// استعراض الفعاليات
export async function listEvents(): Promise<EventRec[]> {
  return localEvents.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

// عملاء وهميون لمنع أي خطأ في الاستدعاء
export const s3 = { send: async () => ({ $metadata: { httpStatusCode: 200 } }) };
export const rek = { send: async () => ({}) };
