import { Router } from 'express';
import { createTaskSchema, updateTaskSchema } from '@nexusflow/shared';
import * as taskController from './tasks.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();
router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'manager', 'project_manager'),
  validate(createTaskSchema),
  taskController.create,
);
router.get('/:id', taskController.getOne);
router.put(
  '/:id',
  authorize('admin', 'manager', 'project_manager'),
  validate(updateTaskSchema),
  taskController.update,
);
router.delete('/:id', authorize('admin', 'manager'), taskController.remove);

router.post('/:id/comments', taskController.addComment);
router.post(
  '/:id/dependencies',
  authorize('admin', 'manager', 'project_manager'),
  taskController.addDependency,
);
router.delete(
  '/:id/dependencies/:depId',
  authorize('admin', 'manager', 'project_manager'),
  taskController.removeDependency,
);

export default router;
