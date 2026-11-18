"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Logo from "../Logo";
import NewEventForm from "./NewEventForm";
import UploadZone from "./UploadZone";
import EventLink from "./EventLink";
import UserMenu from "./UserMenu";
import { fmtDate, type EventRec, type UploadItem } from "@/lib/events";
import { uploadPhoto } from "@/lib/upload";

const CONCURRENCY = 4;
const supported = (f: File) => f.type === "image/jpeg" || f.type === "image/png";

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventRec[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [uploads, setUploads] = useState<Record<string, UploadItem[]>>({});

  const active = events.find((e) => e.id === activeId);
  const items = active ? uploads[active.id] ?? [] : [];

  useEffect(() => {
    fetch("/admin/api/events")
      .then((r) => {
        if (r.status === 401) { location.href = "/login?next=/admin"; return Promise.reject(); }
        return r.ok ? r.json() : Promise.reject();
      })
      .then((list: EventRec[]) => { setEvents(list); setActiveId(list[0]?.id ?? null); })
      .catch(() => setMessage("تعذّر تحميل الفعاليات. تحقق من إعدادات AWS في ملف .env.local."))
      .finally(() => setLoading(false));
  }, []);

  async function createEvent(v: { name: string; client: string; date: string }) {
    setMessage(null);
    const res = await fetch("/admin/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(v),
    });
    if (!res.ok) return setMessage("تعذّر إنشاء الفعالية. تحقق من إعدادات AWS وصلاحيات المستخدم.");
    const ev: EventRec = await res.json();
    setEvents((list) => [ev, ...list]);
    setActiveId(ev.id);
    setCreating(false);
  }

  const patch = (evId: string, id: string, p: Partial<UploadItem>) =>
    setUploads((u) => ({ ...u, [evId]: (u[evId] ?? []).map((i) => (i.id === id ? { ...i, ...p } : i)) }));

  async function runQueue(evId: string, queue: UploadItem[]) {
    let next = 0;
    const worker = async () => {
      while (next < queue.length) {
        const item = queue[next++];
        patch(evId, item.id, { status: "uploading", progress: 0 });
        try {
          await uploadPhoto(item.file, evId, (progress) => patch(evId, item.id, { progress }));
          patch(evId, item.id, { status: "done", progress: 100 });
        } catch {
          patch(evId, item.id, { status: "error" });
        }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  }

  function addFiles(files: File[]) {
    if (!active) return;
    const skipped = files.filter((f) => f.type.startsWith("image/") && !supported(f)).length;
    setMessage(skipped ? `تم تجاهل ${skipped} ملف. الصيغ المدعومة: JPG وPNG.` : null);
    const queue: UploadItem[] = files.filter(supported).map((file) => ({ id: crypto.randomUUID(), file, progress: 0, status: "queued" }));
    if (!queue.length) return;
    setUploads((u) => ({ ...u, [active.id]: [...(u[active.id] ?? []), ...queue] }));
    runQueue(active.id, queue);
  }

  const retryFailed = () => active && runQueue(active.id, items.filter((i) => i.status === "error"));

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-sm text-muted">لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
            <button onClick={() => setCreating(true)} className="flex h-10 items-center gap-2 rounded-xl bg-electric px-4 text-sm font-semibold btn-primary">
              <Plus size={16} /> فعالية جديدة
            </button>
          </div>
        </div>
      </header>

      {message && (
        <div className="mx-auto mt-6 max-w-6xl px-6">
          <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{message}</p>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-2">
          {!loading && events.length === 0 && <p className="text-sm text-muted">لا توجد فعاليات بعد.</p>}
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => { setActiveId(e.id); setCreating(false); }}
              className={`rounded-2xl p-4 text-start ring-1 transition ${
                e.id === activeId && !creating ? "bg-panel ring-electric" : "ring-line hover:bg-panel"
              }`}
            >
              <p className="font-semibold">{e.name}</p>
              <p className="mt-1 text-sm text-muted">{e.client || "بدون عميل"}</p>
              <p className="mt-0.5 text-xs text-muted/80">{fmtDate(e.date)}</p>
            </button>
          ))}
        </aside>

        <main>
          {loading ? (
            <p className="text-muted">جاري التحميل...</p>
          ) : creating || !active ? (
            <NewEventForm onCreate={createEvent} onCancel={events.length ? () => setCreating(false) : undefined} />
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{active.name}</h1>
                <p className="mt-2 text-muted">{active.client ? `${active.client}، ` : ""}{fmtDate(active.date)}</p>
              </div>
              <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                <UploadZone items={items} onFiles={addFiles} onRetry={retryFailed} />
                <EventLink slug={active.slug} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
