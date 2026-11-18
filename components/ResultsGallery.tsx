import { Download, RotateCcw } from "lucide-react";
import type { MatchedPhoto } from "@/lib/api";
import type { Strings } from "@/lib/strings";

type Props = { t: Strings; photos: MatchedPhoto[]; selfie: string; onRetry: () => void };

// On devices with hover the download overlay fades in on hover/focus; on touch screens it is always visible.
const overlay =
  "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3 pt-14 transition duration-300 " +
  "[@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 " +
  "[@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 " +
  "[@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100";

export default function ResultsGallery({ t, photos, selfie, onRetry }: Props) {
  return (
    <section className="flex flex-1 flex-col pt-6">
      <div className="flex animate-fade-in items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={selfie} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-electric ring-offset-2 ring-offset-ink" />
        <div>
          <h2 className="text-2xl font-bold">{t.resultsTitle(photos.length)}</h2>
          <p className="mt-0.5 text-sm text-muted">{t.resultsSub}</p>
        </div>
      </div>

      <ul className="mt-8 columns-2 gap-4">
        {photos.map((p, i) => (
          <li
            key={p.id}
            style={{ animationDelay: `${Math.min(i, 12) * 70}ms` }}
            className="group relative mb-4 animate-fade-in break-inside-avoid overflow-hidden rounded-2xl bg-panel shadow-lg shadow-black/50 ring-1 ring-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.thumbUrl}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ aspectRatio: `${p.width} / ${p.height}` }}
              className="w-full object-cover"
            />
            <div className={overlay}>
              <a
                href={p.downloadUrl}
                download={p.filename}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white/15 text-[13px] font-medium text-white backdrop-blur-md transition duration-200 hover:bg-electric active:scale-95"
              >
                <Download size={15} /> {t.download}
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="sticky bottom-0 -mx-6 mt-auto bg-gradient-to-t from-ink via-ink/95 to-transparent px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
        <button onClick={onRetry} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm text-muted ring-1 ring-line btn-ghost">
          <RotateCcw size={16} /> {t.again}
        </button>
      </div>
    </section>
  );
}
