/**
 * ============================================================
 * TODO 12 (Encontro 2) -- Configuracao do multer
 * ============================================================
 * multer.diskStorage: destino "uploads/", nome de arquivo GERADO
 * pelo servidor (nunca o nome original do cliente -- e o que
 * previne path traversal).
 *
 * fileFilter: so aceitar image/jpeg e image/png.
 * limits.fileSize: 2 * 1024 * 1024 (2MB).
 *
 * export const uploadPhoto = multer({ storage, limits, fileFilter });
 * ============================================================
 */

import multer from "multer";
import { UnprocessableEntityError } from "../errors/HttpError.ts";
import crypto from "crypto";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/", 
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Limite de 2 Megabytes
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});
