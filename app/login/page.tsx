"use client";

import { useState } from "react";
import Logo from "@/components/Logo";

const field =
  "h-12 w-full rounded-xl bg-ink px-4 text-[15px] ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-electric";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).catch(() => null);
    if (res?.ok) {
      const next = new URLSearchParams(location.search).get("next");
      location.href = next && next.startsWith("/admin") ? next : "/admin";
      return;
    }
    setBusy(false);
    setError(
      res?.status === 401 ? "اسم المستخدم أو كلمة المرور غير صحيحة."
      : res?.status === 429 ? "محاولات كثيرة. حاول مرة أخرى بعد قليل."
      : "تعذّر تسجيل الدخول. تحقق من إعدادات الخادم."
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
      <form onSubmit={submit} className="rounded-3xl bg-panel p-7 ring-1 ring-line">
        <h1 className="text-xl font-semibold">تسجيل الدخول</h1>
        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            اسم المستخدم
            <input value={username} onChange={(e) => setUsername(e.target.value)} dir="ltr" autoComplete="username" required className={field} />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            كلمة المرور
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" autoComplete="current-password" required className={field} />
          </label>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        <button disabled={busy} className="mt-6 h-12 w-full rounded-xl bg-electric font-semibold disabled:opacity-60 btn-primary">
          {busy ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </main>
  );
}
