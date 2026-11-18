// Downscale before upload: faster on mobile data and well under Rekognition's 5 MB limit.

function toJpeg(src: CanvasImageSource, w: number, h: number, max: number): Promise<Blob> {
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(src, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.88)
  );
}

// Sent un-mirrored: the live preview is mirrored with CSS only.
export const videoToJpeg = (v: HTMLVideoElement, max = 1024) => toJpeg(v, v.videoWidth, v.videoHeight, max);

export async function fileToJpeg(file: Blob, max = 1024) {
  const bmp = await createImageBitmap(file); // respects EXIF orientation
  const out = await toJpeg(bmp, bmp.width, bmp.height, max);
  bmp.close();
  return out;
}

// Small JPEG for the guest grid, created in the admin's browser before upload.
export async function makeThumb(file: Blob, max = 640) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const blob = await toJpeg(bmp, bmp.width, bmp.height, max);
  bmp.close();
  return { blob, width, height };
}
