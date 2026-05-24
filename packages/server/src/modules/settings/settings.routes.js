import { Router } from 'express';
import * as settingsController from './settings.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', settingsController.getAll);
router.put('/', settingsController.update);

export default router;
