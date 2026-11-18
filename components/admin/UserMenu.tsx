"use client";

import { useEffect, useState } from "react";
import { LogOut, Users } from "lucide-react";

export default function UserMenu() {
  const [me, setMe] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/admin/api/me").then((r) => (r.ok ? r.json() : Promise.reject())).then(setMe).catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    location.href = "/login";
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {me && <span className="text-muted" dir="ltr">{me.username}</span>}
      {me?.role === "owner" && (
        <a href="/admin/users" className="flex h-10 items-center gap-2 rounded-xl px-3 text-muted ring-1 ring-line btn-ghost">
          <Users size={16} /> المستخدمون
        </a>
      )}
      <button onClick={logout} aria-label="تسجيل الخروج" className="flex h-10 w-10 items-center justify-center rounded-xl text-muted ring-1 ring-line btn-ghost">
        <LogOut size={16} />
      </button>
    </div>
  );
}
