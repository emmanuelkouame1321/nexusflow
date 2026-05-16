import { Router } from 'express';
import { createInvoiceSchema, addPaymentSchema } from '@nexusflow/shared';
import * as invoiceController from './invoices.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getOne);
router.post(
  '/',
  authorize('admin', 'manager', 'commercial'),
  validate(createInvoiceSchema),
  invoiceController.create,
);
router.post(
  '/:id/payments',
  authorize('admin', 'manager', 'commercial'),
  validate(addPaymentSchema),
  invoiceController.addPayment,
);
router.get('/:id/balance', invoiceController.getBalance);
router.delete('/:id', authorize('admin'), invoiceController.remove);

export default router;
