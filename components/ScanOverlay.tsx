import { Loader2 } from "lucide-react";
import { Frame, FaceGuide } from "./Frame";
import type { Strings } from "@/lib/strings";

// Face-mesh landmarks in a 100 x 133 space, centered on the oval guide
const P: [number, number][] = [
  [50, 38], [40, 41], [60, 41],
  [35, 47], [45, 46], [55, 46], [65, 47],
  [40, 53], [60, 53],
  [50, 58], [50, 68], [45, 71], [55, 71],
  [42, 79], [50, 81], [58, 79],
  [33, 63], [67, 63], [35, 76], [65, 76],
  [40, 87], [60, 87], [50, 93],
];
const L: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 4], [5, 6], [4, 7], [5, 8], [7, 9], [8, 9], [9, 10],
  [10, 11], [10, 12], [11, 13], [12, 15], [13, 14], [14, 15], [7, 16], [8, 17], [16, 18], [17, 19],
  [18, 20], [19, 21], [20, 22], [21, 22], [13, 20], [15, 21], [16, 11], [17, 12],
];

export default function ScanOverlay({ t, preview, mirrored }: { t: Strings; preview: string; mirrored: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <Frame className="aspect-[3/4] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="" className={`absolute inset-0 h-full w-full object-cover brightness-[0.7] ${mirrored ? "-scale-x-100" : ""}`} />
        <FaceGuide active />

        <svg viewBox="0 0 100 133" className="absolute inset-0 z-10 h-full w-full" aria-hidden>
          {L.map(([a, b], i) => (
            <path
              key={i}
              d={`M${P[a][0]} ${P[a][1]}L${P[b][0]} ${P[b][1]}`}
              pathLength={1}
              stroke="#FF5C5C"
              strokeOpacity={0.6}
              strokeWidth={0.3}
              fill="none"
              className="animate-draw"
              style={{ strokeDasharray: 1, strokeDashoffset: 1, animationDelay: `${i * 45}ms` }}
            />
          ))}
          {P.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={0.9} fill="#FF5C5C" className="animate-node" style={{ animationDelay: `${i * 110}ms` }} />
          ))}
        </svg>

        {/* Glowing scan line with a soft trail, sweeping top to bottom */}
        <div className="pointer-events-none absolute inset-0 z-10 animate-scan will-change-transform">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-electric/30" />
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-electric-soft shadow-[0_0_18px_4px_rgba(218,17,17,0.85)]" />
        </div>

        <div role="status" aria-live="polite" className="absolute inset-x-0 bottom-7 z-30 flex justify-center">
          <span className="flex items-center gap-2.5 rounded-full bg-black/60 px-5 py-2.5 text-sm backdrop-blur-md ring-1 ring-white/10">
            <Loader2 size={16} className="animate-spin text-electric-soft" />
            {t.analyzing}
          </span>
        </div>
      </Frame>
      <p className="mt-8 text-sm text-muted">{t.analyzingSub}</p>
    </div>
  );
}
