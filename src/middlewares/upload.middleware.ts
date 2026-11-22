import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../utils/env.js";
import { createId } from "../utils/ids.js";

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function createDiskUpload(subdir: string) {
  const destinationDir = path.join(env.UPLOAD_DIR, subdir);
  fs.mkdirSync(destinationDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destinationDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${createId()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
        cb(new Error("Only PDF and image files are allowed"));
        return;
      }
      cb(null, true);
    },
  });
}

export const certificateUpload = createDiskUpload("certificates");
export const paySlipUpload = createDiskUpload("payslips");