export type MatchedPhoto = {
  id: string;
  thumbUrl: string; // small preview shown in the grid
  downloadUrl: string; // presigned S3 link to the original (forces download)
  filename: string;
  width: number;
  height: number;
};

export async function searchFaces(selfie: Blob, slug: string): Promise<MatchedPhoto[]> {
  if (slug === "demo") return demoPhotos(); // UI preview without AWS: open the site root "/"

  const body = new FormData();
  body.append("selfie", selfie, "selfie.jpg");
  const res = await fetch(`/api/search/${slug}`, { method: "POST", body });
  if (!res.ok) throw new Error(`search ${res.status}`);
  return (await res.json()).photos;
}

async function demoPhotos(): Promise<MatchedPhoto[]> {
  await new Promise((r) => setTimeout(r, 400));
  const sizes: [number, number][] = [[800, 1000], [800, 600], [800, 1200], [800, 800], [800, 1000], [800, 600], [800, 1100], [800, 800]];
  return sizes.map(([width, height], i) => {
    const hue = 215 + ((i * 17) % 50);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 60% 22%)"/><stop offset="1" stop-color="hsl(${hue + 20} 40% 8%)"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/><circle cx="${width * 0.5}" cy="${height * 0.42}" r="${width * 0.16}" fill="hsl(${hue} 70% 60% / .35)"/><rect x="${width * 0.28}" y="${height * 0.6}" width="${width * 0.44}" height="${height * 0.3}" rx="${width * 0.2}" fill="hsl(${hue} 70% 60% / .22)"/></svg>`;
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    return { id: `demo-${i}`, thumbUrl: url, downloadUrl: url, filename: `rec-studio-${String(i + 1).padStart(2, "0")}.svg`, width, height };
  });
}
