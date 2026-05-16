import prisma from '../../lib/prisma.js';

export async function findAll() {
  return prisma.product.findMany({ orderBy: { name: 'asc' } });
}

export async function findById(id) {
  return prisma.product.findUnique({ where: { id } });
}

export async function create(data) {
  return prisma.product.create({ data });
}

export async function update(id, data) {
  return prisma.product.update({ where: { id }, data });
}

export async function remove(id) {
  return prisma.product.delete({ where: { id } });
}
