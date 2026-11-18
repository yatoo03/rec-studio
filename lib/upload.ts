import { makeThumb } from "./image";

function put(url: string, body: Blob, type: string, onProgress?: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.((e.loaded / e.total) * 100);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`S3 ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(body);
  });
}

// Browser -> S3 directly (presigned URLs), then the server indexes the faces.
export async function uploadPhoto(file: File, slug: string, onProgress: (pct: number) => void): Promise<void> {
  if (file.type !== "image/jpeg" && file.type !== "image/png") throw new Error("unsupported");

  const thumb = await makeThumb(file);
  const res = await fetch(`/admin/api/events/${slug}/upload-url`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contentType: file.type, width: thumb.width, height: thumb.height }),
  });
  if (!res.ok) throw new Error("presign");
  const { ref, originalUrl, thumbUrl } = await res.json();

  await put(thumbUrl, thumb.blob, "image/jpeg");
  await put(originalUrl, file, file.type, (p) => onProgress(Math.round(p * 0.95)));

  const idx = await fetch(`/admin/api/events/${slug}/index`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ref }),
  });
  if (!idx.ok) throw new Error("index");
  onProgress(100);
}
