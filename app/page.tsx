import GuestFlow from "@/components/GuestFlow";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24 relative">
      {/* حاوية زر اللغة وزر الترس بجانب بعضهما في نفس الموضع */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-50">
        <button className="text-white text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition border border-zinc-700">
          EN
        </button>

        <a
          href="/admin"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800/80 text-white hover:bg-zinc-700 transition border border-zinc-700 text-sm"
          title="لوحة التحكم"
        >
          ⚙️
        </a>
      </div>

<GuestFlow slug="demo" />
    </main>
  );
}
