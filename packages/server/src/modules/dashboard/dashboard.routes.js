import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();
router.use(authenticate);

// Dashboard complet accessible à tous les rôles autorisés
router.get(
  '/',
  authorize('admin', 'manager', 'commercial', 'project_manager'),
  dashboardController.getFull,
);

// Endpoints individuels pour le détail
router.get('/revenue', authorize('admin', 'manager'), dashboardController.getMonthlyRevenue);
router.get(
  '/outstanding',
  authorize('admin', 'manager'),
  dashboardController.getOutstandingInvoices,
);
router.get(
  '/pipeline',
  authorize('admin', 'manager', 'commercial'),
  dashboardController.getQuotesPipeline,
);
router.get(
  '/workload',
  authorize('admin', 'manager', 'project_manager'),
  dashboardController.getUsersWorkload,
);
router.get(
  '/overdue-projects',
  authorize('admin', 'manager', 'project_manager'),
  dashboardController.getOverdueProjects,
);

export default router;
