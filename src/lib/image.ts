/* Client-side image downscale + compress before storing a photo. Inspection
   photos are kept as data URLs (offline-friendly), so we cap dimensions and use
   JPEG to keep each one ~50–150 KB instead of multi-MB — important for both
   IndexedDB and the Postgres JSONB payload. */
export async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.62
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = dataUrl;
    });
    let { width, height } = img;
    const longest = Math.max(width, height);
    if (longest > maxDim) {
      const s = maxDim / longest;
      width = Math.round(width * s);
      height = Math.round(height * s);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return dataUrl; // fall back to the original if anything fails
  }
}
