"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import Logo from "../Logo";
import { fmtDate } from "@/lib/events";

type U = { username: string; createdAt: string };
const field =
  "h-12 w-full rounded-xl bg-ink px-4 text-[15px] ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-electric";

export default function UsersManager() {
  const [owner, setOwner] = useState("");
  const [users, setUsers] = useState<U[]>([]);
  const [denied, setDenied] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/admin/api/users");
    if (!r.ok) return setDenied(true);
    const d = await r.json();
    setOwner(d.owner);
    setUsers(d.users);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/admin/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) { setUsername(""); setPassword(""); load(); return; }
    setMsg(
      r.status === 409 ? "اسم المستخدم مستخدم بالفعل."
      : r.status === 400 ? "اسم المستخدم 3 أحرف إنجليزية أو أرقام على الأقل، وكلمة المرور 8 أحرف على الأقل."
      : "تعذّر إضافة المستخدم."
    );
  }

  async function remove(name: string) {
    if (!confirm(`حذف المستخدم ${name}؟`)) return;
    await fetch(`/admin/api/users/${encodeURIComponent(name)}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Logo />
          <a href="/admin" className="flex items-center gap-2 text-sm text-muted">الفعاليات <ArrowRight size={16} className="rotate-180" /></a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-bold">المستخدمون</h1>
        {denied ? (
          <p className="mt-6 text-muted">هذه الصفحة للمالك فقط.</p>
        ) : (
          <>
            <ul className="mt-6 flex flex-col gap-2">
              <li className="flex items-center justify-between rounded-2xl bg-panel px-4 py-3 ring-1 ring-line">
                <span dir="ltr">{owner}</span>
                <span className="text-sm text-muted">المالك</span>
              </li>
              {users.map((u) => (
                <li key={u.username} className="flex items-center justify-between rounded-2xl px-4 py-3 ring-1 ring-line">
                  <span dir="ltr">{u.username}</span>
                  <span className="flex items-center gap-4 text-sm text-muted">
                    {fmtDate(u.createdAt)}
                    <button onClick={() => remove(u.username)} aria-label={`حذف ${u.username}`} className="text-red-300"><Trash2 size={16} /></button>
                  </span>
                </li>
              ))}
            </ul>

            <form onSubmit={add} className="mt-8 rounded-3xl bg-panel p-6 ring-1 ring-line">
              <h2 className="text-lg font-semibold">إضافة مستخدم</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  اسم المستخدم
                  <input value={username} onChange={(e) => setUsername(e.target.value)} dir="ltr" required className={field} placeholder="ahmad" />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  كلمة المرور
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" required minLength={8} className={field} />
                </label>
              </div>
              {msg && <p role="alert" className="mt-4 text-sm text-red-300">{msg}</p>}
              <button className="mt-5 h-12 rounded-xl bg-electric px-6 font-semibold btn-primary">إضافة</button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
