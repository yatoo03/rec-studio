export type EventRec = { id: string; slug: string; name: string; client: string; date: string; createdAt?: string };

export type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
};

// Non-guessable slug: the link is the only thing protecting guests' photos.
// Step 4: enforce uniqueness in the database as well.
export function newSlug(len = 8) {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(len)), (n) => alphabet[n % alphabet.length]).join("");
}

export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("ar-u-nu-latn", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
