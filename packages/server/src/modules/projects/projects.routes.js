import { Router } from 'express';
import { createProjectSchema, updateProjectSchema } from '@nexusflow/shared';
import * as projectController from './projects.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', projectController.getAll);
router.get('/:id', projectController.getOne);
router.post(
  '/',
  authorize('admin', 'manager', 'project_manager'),
  validate(createProjectSchema),
  projectController.create,
);
router.put(
  '/:id',
  authorize('admin', 'manager', 'project_manager'),
  validate(updateProjectSchema),
  projectController.update,
);
router.delete('/:id', authorize('admin'), projectController.remove);

export default router;
