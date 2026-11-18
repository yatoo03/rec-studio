export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="REC.STUDIO" width={900} height={372} className={`${size === "lg" ? "h-16" : "h-11"} w-auto`} />
  );
}
