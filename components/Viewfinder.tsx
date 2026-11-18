"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Frame, FaceGuide } from "./Frame";
import { videoToJpeg } from "@/lib/image";
import type { Strings } from "@/lib/strings";

type Props = {
  t: Strings;
  onCapture: (blob: Blob, previewUrl: string) => void;
  onBack: () => void;
  onPickFile: () => void;
};

export default function Viewfinder({ t, onCapture, onBack, onPickFile }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) return stream.getTracks().forEach((tr) => tr.stop());
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => {});
        }
        setReady(true);
      } catch {
        if (!cancelled) setDenied(true); // also covers non-HTTPS origins
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  async function snap() {
    const v = videoRef.current;
    if (!v || !ready) return;
    const blob = await videoToJpeg(v);
    onCapture(blob, URL.createObjectURL(blob));
  }

  return (
    <div className="flex flex-1 flex-col">
      <Frame className="aspect-[3/4] w-full">
        {denied ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
            <p className="text-sm leading-7 text-muted">{t.cameraDenied}</p>
            <button onClick={onPickFile} className="flex h-12 items-center gap-2 rounded-2xl bg-electric px-5 text-sm font-semibold btn-primary">
              <ImagePlus size={18} /> {t.gallery}
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
            <FaceGuide hint={t.hint} />
          </>
        )}
      </Frame>

      <div className="mt-auto flex items-center justify-between pt-8">
        <button onClick={onBack} aria-label={t.back} className="flex h-12 w-12 items-center justify-center rounded-full bg-panel ring-1 ring-line btn-ghost">
          <X size={20} />
        </button>
        <button
          onClick={snap}
          disabled={!ready}
          aria-label={t.capture}
          className="h-20 w-20 rounded-full border-4 border-white/90 p-1.5 transition duration-200 hover:scale-105 disabled:opacity-30"
        >
          <span className="block h-full w-full rounded-full bg-white transition active:scale-90" />
        </button>
        <button onClick={onPickFile} aria-label={t.gallery} className="flex h-12 w-12 items-center justify-center rounded-full bg-panel ring-1 ring-line btn-ghost">
          <ImagePlus size={20} />
        </button>
      </div>
    </div>
  );
}
