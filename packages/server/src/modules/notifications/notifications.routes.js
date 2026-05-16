import { Router } from 'express';
import * as notificationService from './notifications.service.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(
      req.user.id,
      req.query.unread === 'true',
    );
    res.json(notifications);
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
