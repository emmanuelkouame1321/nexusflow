import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', usersController.getAll);

export default router;
