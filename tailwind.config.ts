import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09090B", // zinc-950
        panel: "#18181B", // zinc-900
        line: "rgba(255,255,255,0.08)",
        muted: "#A1A1AA", // zinc-400
        electric: { DEFAULT: "#DA1111", hover: "#F02020", soft: "#FF5C5C" }, // brand red (matches the logo)
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      keyframes: {
        // transform-only sweep (GPU-friendly): the box slides from above the frame to covering it,
        // so the glowing line at its bottom edge travels top to bottom
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "12%": { opacity: "1" },
          "88%": { opacity: "1" },
          "100%": { transform: "translateY(0)", opacity: "0" },
        },
        lock: {
          "0%,100%": { transform: "translate(-50%,-50%) scale(1)" },
          "50%": { transform: "translate(-50%,-50%) scale(1.2)" },
        },
        fadeIn: { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.2" } },
        node: { "0%,100%": { opacity: "0.25" }, "50%": { opacity: "1" } },
        draw: { from: { strokeDashoffset: "1" }, to: { strokeDashoffset: "0" } },
      },
      animation: {
        scan: "scan 2.4s cubic-bezier(0.45,0.05,0.55,0.95) infinite",
        lock: "lock 1.2s ease-in-out infinite",
        "fade-in": "fadeIn 0.6s cubic-bezier(0.22,1,0.36,1) both",
        blink: "blink 1.4s ease-in-out infinite",
        node: "node 1.6s ease-in-out infinite",
        draw: "draw 1.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
