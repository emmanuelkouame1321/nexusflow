import { Router } from 'express';
import * as notificationService from './notifications.service.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { unread, page, limit } = req.query;
    const data = await notificationService.getUserNotifications(
      req.user.id,
      unread === 'true',
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await notificationService.markAsRead(+req.params.id, req.user.id);
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    next(error);
  }
});

export default router;
