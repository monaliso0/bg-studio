function loadImageEl(src: Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(src);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}

/**
 * Expands the alpha mask of a background-removed PNG by `radius` pixels,
 * filling recovered pixels with original image colors.
 * This recovers product edges that the AI incorrectly removed.
 */
export async function refineMask(
  resultBlob: Blob,
  originalFile: File,
  radius = 2
): Promise<Blob> {
  const [resultImg, origImg] = await Promise.all([
    loadImageEl(resultBlob),
    loadImageEl(originalFile),
  ]);

  const { width, height } = resultImg;

  const resCanvas = document.createElement("canvas");
  resCanvas.width = width; resCanvas.height = height;
  const resCtx = resCanvas.getContext("2d")!;
  resCtx.drawImage(resultImg, 0, 0);
  const resData = resCtx.getImageData(0, 0, width, height).data;

  const origCanvas = document.createElement("canvas");
  origCanvas.width = width; origCanvas.height = height;
  const origCtx = origCanvas.getContext("2d")!;
  origCtx.drawImage(origImg, 0, 0, width, height);
  const origData = origCtx.getImageData(0, 0, width, height).data;

  const out = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = resData[i + 3];

      if (alpha > 0) {
        // Keep existing pixel from result
        out.data[i]     = resData[i];
        out.data[i + 1] = resData[i + 1];
        out.data[i + 2] = resData[i + 2];
        out.data[i + 3] = alpha;
      } else {
        // Check if any neighbor belongs to the product
        let maxNeighborAlpha = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            const ni = (ny * width + nx) * 4;
            if (resData[ni + 3] > maxNeighborAlpha) maxNeighborAlpha = resData[ni + 3];
          }
        }
        // If near a product pixel, recover using original image color
        if (maxNeighborAlpha > 128) {
          out.data[i]     = origData[i];
          out.data[i + 1] = origData[i + 1];
          out.data[i + 2] = origData[i + 2];
          out.data[i + 3] = Math.round(maxNeighborAlpha * 0.6);
        }
      }
    }
  }

  const outCanvas = document.createElement("canvas");
  outCanvas.width = width; outCanvas.height = height;
  outCanvas.getContext("2d")!.putImageData(out, 0, 0);
  return new Promise((resolve) => outCanvas.toBlob((b) => resolve(b!), "image/png", 1));
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image dimensions"));
    };
    img.src = url;
  });
}
