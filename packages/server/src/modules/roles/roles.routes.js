import { Router } from 'express';
import * as rolesController from './roles.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);
router.get('/', rolesController.getAll);

export default router;
