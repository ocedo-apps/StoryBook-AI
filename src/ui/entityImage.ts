export type EntityImageErrorCode = "choose" | "read";

export class EntityImageError extends Error {
  readonly code: EntityImageErrorCode;

  constructor(code: EntityImageErrorCode, message: string) {
    super(message);
    this.name = "EntityImageError";
    this.code = code;
  }
}

const THUMB_EDGE = 256;
const IMAGE_EDGE = 1200;
const JPEG_QUALITY = 0.82;

function jpegFromBitmap(bitmap: ImageBitmap, maxEdge: number, quality: number): string {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new EntityImageError("read", "Could not read that image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * One upload → list thumb + export-sized JPEG.
 * The model never sees this.
 */
export async function picturesFromFile(file: File): Promise<{ thumbDataUrl: string; imageDataUrl: string }> {
  const namedPng = file.name.toLowerCase().endsWith(".png");
  if (!file.type.startsWith("image/") && !namedPng) {
    throw new EntityImageError("choose", "Choose an image file.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    return {
      thumbDataUrl: jpegFromBitmap(bitmap, THUMB_EDGE, JPEG_QUALITY),
      imageDataUrl: jpegFromBitmap(bitmap, IMAGE_EDGE, JPEG_QUALITY)
    };
  } finally {
    bitmap.close();
  }
}
