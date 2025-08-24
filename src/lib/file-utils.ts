// ~/lib/file-utils.ts
import { DocumentType } from "@prisma/client";

export const ALLOWED_MIME_TYPES = {
  // Documents
  "application/pdf": { type: DocumentType.EBOOK, ext: "pdf" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    type: DocumentType.PRESENTATION,
    ext: "pptx",
  },
  "application/vnd.ms-powerpoint": {
    type: DocumentType.PRESENTATION,
    ext: "ppt",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    type: DocumentType.DOCUMENT,
    ext: "docx",
  },
  "application/msword": { type: DocumentType.DOCUMENT, ext: "doc" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    type: DocumentType.SPREADSHEET,
    ext: "xlsx",
  },
  "application/vnd.ms-excel": { type: DocumentType.SPREADSHEET, ext: "xls" },
  "text/csv": { type: DocumentType.SPREADSHEET, ext: "csv" },

  // Images
  "image/jpeg": { type: DocumentType.IMAGE, ext: "jpg" },
  "image/jpg": { type: DocumentType.IMAGE, ext: "jpg" },
  "image/png": { type: DocumentType.IMAGE, ext: "png" },

  // Media
  "video/mp4": { type: DocumentType.VIDEO, ext: "mp4" },
  "audio/mpeg": { type: DocumentType.AUDIO, ext: "mp3" },
  "audio/wav": { type: DocumentType.AUDIO, ext: "wav" },
} as const;

export const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB

export function validateFile(file: File) {
  const errors: string[] = [];

  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }

  if (!ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES]) {
    errors.push(`File type ${file.type} is not supported`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES],
  };
}

export function generateFileKey(
  courseId: string,
  filename: string,
  type: DocumentType,
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `courses/${courseId}/${type.toLowerCase()}/${timestamp}_${sanitizedFilename}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
