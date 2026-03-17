export type ExportFormat = "png" | "jpg" | "webp";
export type AspectRatioOption = [number, number] | "original";

export interface ComposeOptions {
  bgColor: string;
  aspectRatio: AspectRatioOption;
  padding: number; // 0–40 (percent of shortest canvas side)
  format: ExportFormat;
  transparent?: boolean;
}

const LONG_SIDE = 1200;

export async function composeImage(
  blob: Blob,
  { bgColor, aspectRatio, padding, format, transparent }: ComposeOptions
): Promise<string> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);

    const rW = aspectRatio === "original" ? img.naturalWidth : aspectRatio[0];
    const rH = aspectRatio === "original" ? img.naturalHeight : aspectRatio[1];

    const [cW, cH] =
      rW >= rH
        ? [LONG_SIDE, Math.round((LONG_SIDE * rH) / rW)]
        : [Math.round((LONG_SIDE * rW) / rH), LONG_SIDE];

    const canvas = document.createElement("canvas");
    canvas.width = cW;
    canvas.height = cH;
    const ctx = canvas.getContext("2d")!;

    if (!transparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, cW, cH);
    }

    // Padding as a fraction of the shortest side
    const pad = (padding / 100) * Math.min(cW, cH);
    const aW = cW - pad * 2;
    const aH = cH - pad * 2;

    // object-contain: scale product to fit available area, preserve ratio
    const scale = Math.min(aW / img.naturalWidth, aH / img.naturalHeight);
    const dW = img.naturalWidth * scale;
    const dH = img.naturalHeight * scale;
    ctx.drawImage(img, (cW - dW) / 2, (cH - dH) / 2, dW, dH);

    const mime = transparent
      ? "image/png"
      : format === "jpg"
      ? "image/jpeg"
      : `image/${format}`;
    return canvas.toDataURL(mime, 0.95);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
