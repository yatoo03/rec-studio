"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";

export default function EventLink({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}/e/${slug}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadQR() {
    const svg = wrap.current?.querySelector("svg");
    if (!svg) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 1024;
      c.getContext("2d")!.drawImage(img, 0, 0, 1024, 1024);
      c.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `rec-studio-qr-${slug}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  }

  return (
    <div className="flex flex-col items-center rounded-3xl bg-panel p-6 ring-1 ring-line">
      <div ref={wrap} className="rounded-2xl bg-white p-3">
        {origin && <QRCodeSVG value={url} size={176} level="M" marginSize={1} bgColor="#ffffff" fgColor="#09090B" />}
        {!origin && <div className="h-[176px] w-[176px]" />}
      </div>

      <p dir="ltr" className="mt-5 w-full truncate rounded-xl bg-ink px-3 py-2.5 text-center text-xs text-muted ring-1 ring-line">
        {url}
      </p>

      <div className="mt-4 flex w-full gap-2">
        <button onClick={copy} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-electric text-sm font-semibold btn-primary">
          {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "تم النسخ" : "نسخ الرابط"}
        </button>
        <button onClick={downloadQR} aria-label="تحميل رمز QR" className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-line btn-ghost">
          <Download size={16} />
        </button>
        <a href={`/e/${slug}`} target="_blank" rel="noreferrer" aria-label="فتح صفحة الضيوف" className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-line btn-ghost">
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
