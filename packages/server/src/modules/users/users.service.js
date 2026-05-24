import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';

export async function findAll() {
  return prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: { select: { id: true, name: true } },
    },
    orderBy: { lastName: 'asc' },
  });
}

export async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export async function create(data) {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: hashedPassword,
      roleId: data.roleId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export async function update(id, data) {
  const payload = {};
  if (data.firstName !== undefined) payload.firstName = data.firstName;
  if (data.lastName !== undefined) payload.lastName = data.lastName;
  if (data.email !== undefined) payload.email = data.email;
  if (data.password) payload.passwordHash = await bcrypt.hash(data.password, 12);
  if (data.roleId !== undefined) payload.roleId = data.roleId;

  return prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export async function remove(id) {
  return prisma.user.delete({ where: { id } });
}
