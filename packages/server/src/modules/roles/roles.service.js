import prisma from '../../lib/prisma.js';

export async function findAll() {
  return prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}
