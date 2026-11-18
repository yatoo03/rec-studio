import type { ReactNode } from "react";

// DSLR focus-screen look: crisp 1px corner marks, faint rule-of-thirds lines, and an AF point.
export function Frame({ children, className = "", grid = true }: { children: ReactNode; className?: string; grid?: boolean }) {
  const m = "pointer-events-none absolute z-20 h-[22px] w-[22px] border-white/80";
  const g = "pointer-events-none absolute z-10 bg-white/[0.07]";
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-panel shadow-2xl shadow-black/60 ring-1 ring-white/10 ${className}`}>
      {children}
      {grid && (
        <>
          <span className={`${g} inset-y-0 left-1/3 w-px`} />
          <span className={`${g} inset-y-0 left-2/3 w-px`} />
          <span className={`${g} inset-x-0 top-1/3 h-px`} />
          <span className={`${g} inset-x-0 top-2/3 h-px`} />
        </>
      )}
      <span className={`${m} left-3.5 top-3.5 border-l border-t`} />
      <span className={`${m} right-3.5 top-3.5 border-r border-t`} />
      <span className={`${m} bottom-3.5 left-3.5 border-b border-l`} />
      <span className={`${m} bottom-3.5 right-3.5 border-b border-r`} />
    </div>
  );
}

// Autofocus point: turns blue and pulses while the face is being analyzed
function AF({ active }: { active: boolean }) {
  const c = `absolute h-2 w-2 ${active ? "border-electric-soft" : "border-white/70"}`;
  return (
    <div className={`pointer-events-none absolute left-1/2 top-[44%] z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 ${active ? "animate-lock" : ""}`}>
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

// Oval cut-out that dims everything outside the face area
export function FaceGuide({ active = false, hint }: { active?: boolean; hint?: string }) {
  return (
    <>
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 z-10 aspect-[4/5] w-[62%] -translate-x-1/2 -translate-y-[54%] rounded-[50%] border transition-colors duration-500 ${
          active
            ? "border-electric-soft/90 shadow-[0_0_0_999px_rgba(9,9,11,0.6),0_0_32px_rgba(218,17,17,0.35)]"
            : "border-white/50 shadow-[0_0_0_999px_rgba(9,9,11,0.55)]"
        }`}
      />
      <AF active={active} />
      {hint && <p className="absolute inset-x-0 bottom-7 z-10 px-6 text-center text-sm text-white/85">{hint}</p>}
    </>
  );
}
