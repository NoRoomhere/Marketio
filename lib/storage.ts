"use client";

import { uploadToCloudinary } from "@/lib/cloudinary";

export type UploadFolder = "avatar" | "logo" | "mediaKit";

/**
 * Uploads a file and returns the public URL.
 * Uses Cloudinary (no Firebase Storage).
 */
export async function uploadFile(
  _uid: string,
  file: File,
  folder: UploadFolder
): Promise<string> {
  return uploadToCloudinary(file, folder);
}

/**
 * Upload with optional progress (Cloudinary doesn't expose progress in unsigned upload; kept for API compatibility).
 */
export function uploadFileWithProgress(
  uid: string,
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (onProgress) onProgress(0);
  return uploadFile(uid, file, folder).then((url) => {
    if (onProgress) onProgress(100);
    return url;
  });
}
