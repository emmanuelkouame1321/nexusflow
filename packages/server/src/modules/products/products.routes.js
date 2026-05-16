import { Router } from 'express';
import * as productController from './products.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
router.post('/', authorize('admin', 'manager'), productController.create);
router.put('/:id', authorize('admin', 'manager'), productController.update);
router.delete('/:id', authorize('admin'), productController.remove);

export default router;
