import * as notificationService from './notifications.service.js';

export async function getAll(req, res, next) {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(+req.params.id);
    res.json(notification);
  } catch (error) {
    next(error);
  }
}
