import { Router } from 'express';
import { createQuoteSchema, updateQuoteStatusSchema } from '@nexusflow/shared';
import * as quoteController from './quotes.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', quoteController.getAll);
router.get('/:id', quoteController.getOne);
router.post(
  '/',
  authorize('admin', 'manager', 'commercial'),
  validate(createQuoteSchema),
  quoteController.create,
);
router.patch(
  '/:id/status',
  authorize('admin', 'manager'),
  validate(updateQuoteStatusSchema),
  quoteController.updateStatus,
);
router.delete('/:id', authorize('admin'), quoteController.remove);

export default router;
