import { Router } from 'express';
import { loginSchema, registerSchema } from '@nexusflow/shared';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();

router.post(
  '/register',
  authenticate,
  authorize('admin'),
  validate(registerSchema),
  authController.register,
);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);
router.put('/change-password', authenticate, authController.changePassword);

export default router;
