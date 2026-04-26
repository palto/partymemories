const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.85;
const JPEG_QUALITY = 0.85;

function supportsWebP(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  try {
    let outputType: string;
    let quality: number | undefined;

    if (file.type === "image/png") {
      outputType = "image/png";
      quality = undefined;
    } else if (supportsWebP()) {
      outputType = "image/webp";
      quality = WEBP_QUALITY;
    } else {
      outputType = "image/jpeg";
      quality = JPEG_QUALITY;
    }

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

    const blob = await canvasToBlob(canvas, outputType, quality);

    if (blob.size >= file.size) return file;

    let name = file.name;
    if (outputType === "image/webp" && !/\.webp$/i.test(file.name)) {
      name = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    } else if (outputType === "image/jpeg" && !/\.jpe?g$/i.test(file.name)) {
      name = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
    }

    return new File([blob], name, { type: outputType });
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
