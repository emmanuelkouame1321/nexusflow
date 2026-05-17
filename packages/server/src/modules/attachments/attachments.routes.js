import { Router } from 'express';
import * as attachmentController from './attachments.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();
router.use(authenticate);

// Upload vers un projet
router.post('/project/:projectId', upload.single('file'), attachmentController.uploadToProject);

// Upload vers une tâche
router.post('/task/:taskId', upload.single('file'), attachmentController.uploadToTask);

// Lister les pièces jointes
router.get('/project/:projectId', attachmentController.getByProject);
router.get('/task/:taskId', attachmentController.getByTask);

// Supprimer une pièce jointe
router.delete('/:id', attachmentController.remove);

export default router;
