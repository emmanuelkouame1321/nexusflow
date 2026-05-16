import prisma from '../../lib/prisma.js';

export async function createNotification(userId, type, message, metadata = null) {
  // Enregistrer en base
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      metadata,
    },
  });

  // Émettre l'événement via Socket.io (si io est disponible)
  const io = global.app?.get('io');
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }

  return notification;
}

export async function getUserNotifications(userId, onlyUnread = false) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(onlyUnread ? { read: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markAsRead(notificationId, userId) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
