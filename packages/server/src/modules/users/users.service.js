import prisma from '../../lib/prisma.js';

let usersCache = null;
let usersCacheTime = 0;

export async function findAll() {
  if (usersCache && Date.now() - usersCacheTime < 300_000) return usersCache;
  usersCache = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: { select: { id: true, name: true } },
    },
    orderBy: { lastName: 'asc' },
  });
  usersCacheTime = Date.now();
  return usersCache;
}
