import GuestFlow from "@/components/GuestFlow";

export default function Home() {
    return <GuestFlow slug="demo" />;
}
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      {/* باقي محتوى الصفحة الرئيسية عندك */}
      
      <div className="flex justify-center items-center my-8">
        <a
          href="/admin"
          className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl shadow-lg hover:bg-zinc-800 transition-all border border-zinc-700 flex items-center gap-2"
        >
          ⚙️ الانتقال لوحة التحكم (Admin)
        </a>
      </div>
    </main>
