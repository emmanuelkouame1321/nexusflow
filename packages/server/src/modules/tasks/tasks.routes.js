import { Router } from 'express';
import { createTaskSchema, updateTaskSchema } from '@nexusflow/shared';
import * as taskController from './tasks.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as tasksService from './tasks.service.js';

const router = Router();
router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'manager', 'project_manager'),
  validate(createTaskSchema),
  taskController.create,
);

router.get('/', async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: 'Paramètre projectId requis' });
    }
    const tasks = await tasksService.findByProject(+projectId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', taskController.getOne);
// router.put(
//   '/:id',
//   authorize('admin', 'manager', 'project_manager'),
//   validate(updateTaskSchema),
//   taskController.update
// );
router.put(
  '/:id',
  authorize('admin', 'manager', 'project_manager'),
  (req, res, next) => {
    console.log('PUT /tasks/:id – body reçu :', JSON.stringify(req.body));
    console.log('Type de status :', typeof req.body.status);
    next();
  },
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
