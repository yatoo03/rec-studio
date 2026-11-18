import GuestFlow from "@/components/GuestFlow";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24 relative">
      {/* زر اللغة وزر الأدمين (الترس) في أعلى الصفحة */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
        <button className="text-white text-sm font-medium px-3 py-1 rounded-md bg-zinc-800/60 hover:bg-zinc-700 transition">
          EN
        </button>

        <a
          href="/admin"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800/60 text-white hover:bg-zinc-700 transition"
          title="لوحة التحكم"
        >
          ⚙️
        </a>
      </div>

      <GuestFlow slug="demo" />
    </main>
  );
}
