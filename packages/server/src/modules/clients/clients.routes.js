import { Router } from 'express';
import { createClientSchema, updateClientSchema } from '@nexusflow/shared';
import * as clientsController from './clients.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

router.get('/', clientsController.getAll);
router.get('/:id', clientsController.getOne);
router.post(
  '/',
  authorize('admin', 'manager', 'commercial'),
  validate(createClientSchema),
  clientsController.create,
);
router.put(
  '/:id',
  authorize('admin', 'manager', 'commercial'),
  validate(updateClientSchema),
  clientsController.update,
);
router.delete('/:id', authorize('admin'), clientsController.remove);

// Contacts
router.post(
  '/:id/contacts',
  authorize('admin', 'manager', 'commercial'),
  clientsController.addContact,
);
router.delete(
  '/:clientId/contacts/:contactId',
  authorize('admin', 'manager'),
  clientsController.removeContact,
);

export default router;
