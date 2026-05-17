import prisma from '../../lib/prisma.js';

export async function createAttachment(file, projectId, taskId, userId) {
  return prisma.attachment.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      projectId: projectId || null,
      taskId: taskId || null,
      uploadedBy: userId || null,
    },
  });
}

export async function getAttachmentsForProject(projectId) {
  return prisma.attachment.findMany({
    where: { projectId },
    include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAttachmentsForTask(taskId) {
  return prisma.attachment.findMany({
    where: { taskId },
    include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteAttachment(id) {
  return prisma.attachment.delete({ where: { id } });
}
