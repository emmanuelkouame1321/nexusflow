import prisma from '../../lib/prisma.js';

/**
 * Crée un projet.
 */
export async function createProject(data) {
  const { name, description, clientId, startDate, endDate, budget, memberIds } = data;

  return prisma.project.create({
    data: {
      name,
      description: description || null,
      clientId: clientId || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget: budget || null,
      members: memberIds ? { create: memberIds.map((userId) => ({ userId })) } : undefined,
    },
    include: {
      members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      client: { select: { id: true, name: true } },
      tasks: true,
    },
  });
}

/**
 * Récupère tous les projets avec filtres.
 */
export async function findAll({ status, clientId, search, page = '1', limit = '20' }) {
  const where = {};
  if (status) where.status = status;
  if (clientId) where.clientId = parseInt(clientId, 10);
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        client: { select: { id: true, name: true } },
        tasks: true,
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count({ where }),
  ]);

  return { projects, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
}

/**
 * Récupère un projet par ID.
 */
export async function findById(id) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      client: true,
      tasks: { include: { assignees: true, comments: true, dependencies: true } },
    },
  });
}

/**
 * Calcule la progression d'un projet (pourcentage de tâches terminées).
 */
export async function getProgress(projectId) {
  const tasks = await prisma.task.findMany({ where: { projectId }, select: { status: true } });
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

/**
 * Met à jour un projet.
 */
export async function updateProject(id, data) {
  const { name, description, clientId, startDate, endDate, budget, status, memberIds } = data;

  // Si on fournit des membres, on remplace la liste existante
  if (memberIds) {
    await prisma.projectMember.deleteMany({ where: { projectId: id } });
  }

  return prisma.project.update({
    where: { id },
    data: {
      name: name || undefined,
      description: description !== undefined ? description : undefined,
      clientId: clientId !== undefined ? clientId : undefined,
      startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
      endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
      budget: budget !== undefined ? budget : undefined,
      status: status || undefined,
      members: memberIds ? { create: memberIds.map((userId) => ({ userId })) } : undefined,
    },
    include: {
      members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      client: { select: { id: true, name: true } },
      tasks: true,
    },
  });
}

/**
 * Supprime un projet.
 */
export async function removeProject(id) {
  return prisma.project.delete({ where: { id } });
}
