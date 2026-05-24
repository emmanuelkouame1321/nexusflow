import * as notificationService from './notifications.service.js';

export async function getAll(req, res, next) {
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
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(parseInt(req.params.id, 10));
    res.json(notification);
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ message: 'Tout est lu.' });
  } catch (error) {
    next(error);
  }
}
