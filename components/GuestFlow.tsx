"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RotateCcw, SearchX, WifiOff } from "lucide-react";
import Logo from "./Logo";
import { Frame, FaceGuide } from "./Frame";
import Viewfinder from "./Viewfinder";
import ScanOverlay from "./ScanOverlay";
import ResultsGallery from "./ResultsGallery";
import { strings, type Lang } from "@/lib/strings";
import { fileToJpeg } from "@/lib/image";
import { searchFaces, type MatchedPhoto } from "@/lib/api";

type Phase = "welcome" | "camera" | "scanning" | "results" | "empty" | "error";
const MIN_SCAN_MS = 2600; // keep the animation readable even when the API answers fast

export default function GuestFlow({ slug }: { slug: string }) {
  const [lang, setLang] = useState<Lang>("ar");
  const [phase, setPhase] = useState<Phase>("welcome");
  const [preview, setPreview] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(false);
  const [photos, setPhotos] = useState<MatchedPhoto[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = strings[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function runSearch(blob: Blob, url: string, isMirrored: boolean) {
    setPreview(url);
    setMirrored(isMirrored);
    setPhase("scanning");
    try {
      const [found] = await Promise.all([searchFaces(blob, slug), new Promise((r) => setTimeout(r, MIN_SCAN_MS))]);
      setPhotos(found);
      setPhase(found.length ? "results" : "empty");
    } catch {
      setPhase("error");
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const jpg = await fileToJpeg(file);
      runSearch(jpg, URL.createObjectURL(jpg), false);
    } catch {
      setPhase("error");
    }
  }

  const pick = () => fileRef.current?.click();
  const retry = () => setPhase("camera");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <Logo />
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="h-9 rounded-full px-3.5 text-xs font-medium text-muted ring-1 ring-line btn-ghost"
        >
          {t.switchTo}
        </button>
      </header>

      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {phase === "welcome" && (
        <section className="flex flex-1 flex-col items-center pt-8 text-center">
          <Frame className="aspect-[3/4] h-[36dvh]">
            <FaceGuide />
            <span className="absolute left-1/2 top-5 z-30 h-2 w-2 -translate-x-1/2 animate-blink rounded-full bg-electric" />
          </Frame>

          <h1 className="mt-10 text-5xl font-bold leading-[1.25]">{t.headline}</h1>
          <p className="mt-4 max-w-[19rem] text-base leading-8 text-muted">{t.sub}</p>

          <div className="mt-auto flex w-full flex-col gap-4 pt-10">
            <button
              onClick={() => setPhase("camera")}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-electric text-base font-semibold btn-primary"
            >
              <Camera size={20} /> {t.selfie}
            </button>
            <button onClick={pick} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm text-muted ring-1 ring-line btn-ghost">
              <ImagePlus size={18} /> {t.gallery}
            </button>
            <p className="pt-1 text-xs text-muted">{t.privacy}</p>
          </div>
        </section>
      )}

      {phase === "camera" && (
        <section className="flex flex-1 flex-col pt-6">
          <Viewfinder t={t} onCapture={(blob, url) => runSearch(blob, url, true)} onBack={() => setPhase("welcome")} onPickFile={pick} />
        </section>
      )}

      {phase === "scanning" && preview && (
        <section className="flex flex-1 flex-col pt-6">
          <ScanOverlay t={t} preview={preview} mirrored={mirrored} />
        </section>
      )}

      {phase === "results" && preview && <ResultsGallery t={t} photos={photos} selfie={preview} onRetry={retry} />}

      {(phase === "empty" || phase === "error") && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-panel ring-1 ring-line text-electric-soft">
            {phase === "empty" ? <SearchX size={28} /> : <WifiOff size={28} />}
          </div>
          <h2 className="mt-6 text-xl font-semibold">{phase === "empty" ? t.emptyTitle : t.errorTitle}</h2>
          <p className="mt-3 max-w-[20rem] text-[15px] leading-7 text-muted">{phase === "empty" ? t.emptyBody : t.errorBody}</p>
          <button onClick={retry} className="mt-8 flex h-12 items-center gap-2 rounded-2xl bg-electric px-6 text-sm font-semibold btn-primary">
            <RotateCcw size={16} /> {t.again}
          </button>
        </section>
      )}
    </main>
  );
}
