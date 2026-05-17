import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import env from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Déterminer le dossier de destination (racine du projet + uploads)
const uploadDir = path.resolve(__dirname, '..', '..', '..', '..', 'uploads');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Filtre sur les types MIME autorisés
function fileFilter(req, file, cb) {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé : ${file.mimetype}`), false);
  }
}

// Middleware configuré
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSize || 10 * 1024 * 1024, // 10 MB par défaut
  },
});
