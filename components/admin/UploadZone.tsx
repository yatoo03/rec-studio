"use client";

import { useRef, useState } from "react";
import { FolderUp, RotateCcw, UploadCloud } from "lucide-react";
import type { UploadItem } from "@/lib/events";

type Props = { items: UploadItem[]; onFiles: (files: File[]) => void; onRetry: () => void };

export default function UploadZone({ items, onFiles, onRetry }: Props) {
  const filesRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const failed = items.filter((i) => i.status === "error").length;
  const active = items.filter((i) => i.status === "uploading").slice(0, 4);
  const pct = total ? Math.round(items.reduce((s, i) => s + i.progress, 0) / total) : 0;

  const pick = (list: FileList | null) => list && onFiles(Array.from(list));

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files); }}
        className={`flex flex-col items-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition ${
          over ? "border-electric bg-electric/10" : "border-white/15 bg-panel"
        }`}
      >
        <UploadCloud size={40} className="text-electric-soft" />
        <p className="mt-5 text-lg font-semibold">اسحب الصور هنا</p>
        <p className="mt-1 text-sm text-muted">ارفع آلاف الصور دفعة واحدة بجودتها الأصلية (JPG أو PNG).</p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => filesRef.current?.click()} className="h-11 rounded-xl bg-electric px-5 text-sm font-semibold btn-primary">
            اختر صورًا
          </button>
          <button onClick={() => folderRef.current?.click()} className="flex h-11 items-center gap-2 rounded-xl px-5 text-sm ring-1 ring-line btn-ghost">
            <FolderUp size={16} /> اختر مجلدًا
          </button>
        </div>
        <input ref={filesRef} type="file" accept="image/jpeg,image/png" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
        <input
          ref={folderRef}
          type="file"
          multiple
          hidden
          {...({ webkitdirectory: "", directory: "" } as object)}
          onChange={(e) => { pick(e.target.files); e.target.value = ""; }}
        />
      </div>

      {total > 0 && (
        <div className="rounded-2xl bg-panel p-5 ring-1 ring-line">
          <div className="flex items-center justify-between text-sm">
            <span>تم رفع {done} من {total}</span>
            <span className="text-muted">{pct}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-electric transition-[width]" style={{ width: `${pct}%` }} />
          </div>

          {active.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1.5 text-xs text-muted" dir="ltr">
              {active.map((i) => (
                <li key={i.id} className="flex justify-between gap-4">
                  <span className="truncate">{i.file.name}</span>
                  <span>{i.progress}%</span>
                </li>
              ))}
            </ul>
          )}

          {failed > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <span>فشل رفع {failed} صورة</span>
              <button onClick={onRetry} className="flex items-center gap-1.5 font-medium">
                <RotateCcw size={14} /> إعادة المحاولة
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
