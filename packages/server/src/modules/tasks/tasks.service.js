import prisma from '../../lib/prisma.js';
import { createNotification } from '../notifications/notifications.service.js';
/**
 * Crée une tâche dans un projet.
 */
export async function createTask(data) {
  const {
    title,
    description,
    projectId,
    parentTaskId,
    priority,
    dueDate,
    estimatedHours,
    assigneeIds,
  } = data;

  // Créer la tâche d’abord et la stocker
  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      projectId,
      parentTaskId: parentTaskId || null,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours || null,
      assignees: assigneeIds ? { create: assigneeIds.map((userId) => ({ userId })) } : undefined,
    },
    include: {
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      comments: true,
      dependencies: true,
    },
  });

  // Notifier chaque assigné après la création
  if (assigneeIds && assigneeIds.length > 0) {
    await Promise.all(
      assigneeIds.map((userId) =>
        createNotification(
          userId,
          'task_assigned',
          `Vous avez été assigné à la tâche « ${task.title} ».`,
          { taskId: task.id, projectId: task.projectId },
        ),
      ),
    );
  }

  return task;
}

export async function findByProject(projectId) {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      comments: true,
      dependencies: true,
      subTasks: true,
    },
    orderBy: { id: 'asc' },
  });
}

/**
 * Récupère une tâche par ID.
 */
export async function findById(id) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: { select: { name: true } }, // ← ajouté
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      dependencies: { include: { dependsOn: true } },
      subTasks: true,
    },
  });
}

/**
 * Met à jour une tâche.
 */
export async function updateTask(id, data) {
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    estimatedHours,
    actualHours,
    assigneeIds,
  } = data;

  // Récupérer les assignés actuels si on doit comparer
  let previousAssignees = [];
  if (assigneeIds) {
    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: { assignees: true },
    });
    previousAssignees = currentTask.assignees.map((a) => a.userId);

    // Supprimer tous les assignés existants (ils seront recréés)
    await prisma.taskAssignee.deleteMany({ where: { taskId: id } });
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: title || undefined,
      description: description !== undefined ? description : undefined,
      status: status || undefined,
      priority: priority || undefined,
      dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      estimatedHours: estimatedHours !== undefined ? estimatedHours : undefined,
      actualHours: actualHours !== undefined ? actualHours : undefined,
      assignees: assigneeIds ? { create: assigneeIds.map((userId) => ({ userId })) } : undefined,
    },
    include: {
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      comments: true,
      dependencies: true,
    },
  });

  // Notifier uniquement les nouveaux assignés (ceux qui n'étaient pas déjà là)
  if (assigneeIds) {
    const newAssignees = assigneeIds.filter((userId) => !previousAssignees.includes(userId));
    if (newAssignees.length > 0) {
      await Promise.all(
        newAssignees.map((userId) =>
          createNotification(
            userId,
            'task_assigned',
            `Vous avez été assigné à la tâche « ${task.title} ».`,
            { taskId: task.id, projectId: task.projectId },
          ),
        ),
      );
    }
  }

  return task;
}

/**
 * Supprime une tâche.
 */
export async function removeTask(id) {
  return prisma.task.delete({ where: { id } });
}

/**
 * Ajoute un commentaire à une tâche.
 */
export async function addComment(taskId, userId, text) {
  const comment = await prisma.taskComment.create({
    data: { text, taskId, userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: { select: { name: true } }, // ← ajouté
        },
      },
      task: { include: { assignees: true } },
    },
  });

  // Notifier les autres assignés (sauf l'auteur du commentaire)
  const otherAssignees = comment.task.assignees.map((a) => a.userId).filter((id) => id !== userId);

  await Promise.all(
    otherAssignees.map((id) =>
      createNotification(
        id,
        'task_comment',
        `Nouveau commentaire sur la tâche "${comment.task.title}".`,
        { taskId: comment.taskId },
      ),
    ),
  );

  return comment;
}

/**
 * Ajoute une dépendance entre deux tâches.
 */
export async function addDependency(taskId, dependsOnTaskId) {
  return prisma.taskDependency.create({
    data: {
      taskId,
      dependsOnTaskId,
    },
  });
}

/**
 * Supprime une dépendance.
 */
export async function removeDependency(id) {
  return prisma.taskDependency.delete({ where: { id } });
}
