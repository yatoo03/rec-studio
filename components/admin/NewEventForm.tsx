"use client";

import { useState } from "react";

type Values = { name: string; client: string; date: string };

const field =
  "h-12 w-full rounded-xl bg-ink px-4 text-[15px] ring-1 ring-line placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-electric";

export default function NewEventForm({ onCreate, onCancel }: { onCreate: (v: Values) => void; onCancel?: () => void }) {
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onCreate({ name: name.trim(), client: client.trim(), date });
      }}
      className="mx-auto w-full max-w-xl rounded-3xl bg-panel p-8 ring-1 ring-line"
    >
      <h2 className="text-2xl font-semibold">فعالية جديدة</h2>
      <p className="mt-2 text-sm text-muted">بعد الإنشاء ستحصل على رابط ورمز QR لعرضهما في المكان.</p>

      <div className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm">
          اسم الفعالية
          <input value={name} onChange={(e) => setName(e.target.value)} required className={field} placeholder="حفل تخرج دفعة 2026" />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          العميل
          <input value={client} onChange={(e) => setClient(e.target.value)} className={field} placeholder="اسم العميل أو الجهة" />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          تاريخ الفعالية
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={field} />
        </label>
      </div>

      <div className="mt-8 flex gap-3">
        <button type="submit" className="h-12 flex-1 rounded-xl bg-electric font-semibold transition active:scale-[0.98] btn-primary">
          إنشاء الفعالية
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="h-12 rounded-xl px-6 text-muted ring-1 ring-line btn-ghost">
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
