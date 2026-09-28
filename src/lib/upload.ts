import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Secure local image upload for the gallery.
 * - extension derived from detected content type (never from user filename)
 * - magic-byte validation (not just MIME header)
 * - size limit
 * - random file names, no executables
 */

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

type AllowedType = keyof typeof ALLOWED_TYPES;

function detectImageType(bytes: Uint8Array): AllowedType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

/** Saves an uploaded image under public/uploads and returns its public URL. */
export async function saveImage(file: File): Promise<string> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Dosya boyutu en fazla 5 MB olabilir");
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const detected = detectImageType(buffer);
  if (!detected) {
    throw new UploadError("Yalnızca JPG, PNG veya WebP görselleri yüklenebilir");
  }

  const fileName = `${randomUUID()}${ALLOWED_TYPES[detected]}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/${fileName}`;
}
