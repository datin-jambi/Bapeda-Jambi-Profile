import ImageKit from "imagekit";
import { MediaFolderPath } from "./media-folders";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY ?? "";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? "";
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT ?? "";

if (!publicKey || !privateKey || !urlEndpoint) {
  console.warn("[ImageKit] Missing env vars: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, or IMAGEKIT_URL_ENDPOINT");
}

export const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

// ─── Auth params (for client-side upload) ────────────────────────────────────

export async function getImageKitAuthParams() {
  return imagekit.getAuthenticationParameters();
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResult {
  fileId: string;
  name: string;
  url: string;
  filePath: string;
  thumbnailUrl: string;
  fileType: string;
  size: number;
}

export async function uploadFile(
  file: Buffer | string,
  fileName: string,
  folder: MediaFolderPath
): Promise<UploadResult> {
  const response = await imagekit.upload({
    file,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    fileId: response.fileId,
    name: response.name,
    url: response.url,
    filePath: response.filePath,
    thumbnailUrl: response.thumbnailUrl ?? response.url,
    fileType: response.fileType,
    size: response.size,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteFile(fileId: string): Promise<void> {
  await imagekit.deleteFile(fileId);
}

// ─── URL generation ───────────────────────────────────────────────────────────

export interface ImageTransformation {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "jpg" | "png";
  crop?: "maintain_ratio" | "force" | "at_least" | "at_max";
}

export function getImageKitUrl(
  filePath: string,
  transformations?: ImageTransformation
): string {
  const endpoint = (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? urlEndpoint).replace(/\/$/, "");

  if (!transformations) return `${endpoint}${filePath}`;

  const tr: string[] = [];
  if (transformations.width)   tr.push(`w-${transformations.width}`);
  if (transformations.height)  tr.push(`h-${transformations.height}`);
  if (transformations.quality) tr.push(`q-${transformations.quality}`);
  if (transformations.format)  tr.push(`f-${transformations.format}`);
  if (transformations.crop)    tr.push(`c-${transformations.crop}`);

  return tr.length ? `${endpoint}/tr:${tr.join(",")}${filePath}` : `${endpoint}${filePath}`;
}
