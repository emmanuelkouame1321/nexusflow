import prisma from '../../lib/prisma.js';

/**
 * Récupérer tous les clients avec filtres et pagination.
 */
export async function findAll({ search, sector, page = '1', limit = '20' }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (sector) {
    where.sector = sector;
  }
  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: { contacts: true },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { name: 'asc' },
    }),
    prisma.client.count({ where }),
  ]);
  return { clients, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
}

/**
 * Récupérer un client par ID.
 */
export async function findById(id) {
  return prisma.client.findUnique({
    where: { id },
    include: { contacts: true },
  });
}

/**
 * Créer un nouveau client.
 */
export async function create(data) {
  return prisma.client.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      sector: data.sector,
      tags: data.tags || [],
    },
    include: { contacts: true },
  });
}

/**
 * Mettre à jour un client.
 */
export async function update(id, data) {
  return prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      sector: data.sector,
      tags: data.tags,
    },
    include: { contacts: true },
  });
}

/**
 * Supprimer un client.
 */
export async function remove(id) {
  return prisma.client.delete({ where: { id } });
}

/**
 * Ajouter un contact à un client.
 */
export async function addContact(clientId, contactData) {
  return prisma.contact.create({
    data: {
      ...contactData,
      clientId,
    },
  });
}

/**
 * Supprimer un contact.
 */
export async function removeContact(contactId) {
  return prisma.contact.delete({ where: { id: contactId } });
}
