const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.75;
const JPEG_QUALITY = 0.85;

export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  try {
    const img = await loadImage(file);

    let w = img.naturalWidth;
    let h = img.naturalHeight;
    const longest = Math.max(w, h);
    if (longest > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / longest;
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);

    if (file.type === "image/png") {
      const blob = await canvasToBlob(canvas, "image/png", undefined);
      if (blob.size >= file.size) return file;
      return new File([blob], file.name, { type: "image/png" });
    }

    // Try WebP first; fall back to JPEG if the browser didn't actually encode it as WebP.
    const webpBlob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
    if (webpBlob.type === "image/webp") {
      if (webpBlob.size >= file.size) return file;
      const name = file.name.replace(/\.[^/.]+$/, "") + ".webp";
      return new File([webpBlob], name, { type: "image/webp" });
    }

    const jpegBlob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
    if (jpegBlob.size >= file.size) return file;
    const name = /\.jpe?g$/i.test(file.name)
      ? file.name
      : file.name.replace(/\.[^/.]+$/, "") + ".jpg";
    return new File([jpegBlob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode failed")); };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number | undefined,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality,
    );
  });
}
