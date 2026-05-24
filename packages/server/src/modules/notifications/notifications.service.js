import prisma from '../../lib/prisma.js';

export async function createNotification(userId, type, message, metadata = {}) {
  const notification = await prisma.notification.create({
    data: { userId, type, message, metadata },
  });

  // Émettre via Socket.io (si le service socket est disponible)
  const io = global.app?.get('io');
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }

  return notification;
}

export async function getUserNotifications(userId, unreadOnly = false, page = 1, limit = 20) {
  const where = { userId };
  if (unreadOnly) where.read = false;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
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
