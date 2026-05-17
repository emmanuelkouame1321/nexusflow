import * as attachmentService from './attachments.service.js';

export async function uploadToProject(req, res, next) {
  try {
    const attachment = await attachmentService.createAttachment(
      req.file,
      +req.params.projectId,
      null,
      req.user.id,
    );
    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
}

export async function uploadToTask(req, res, next) {
  try {
    const attachment = await attachmentService.createAttachment(
      req.file,
      null,
      +req.params.taskId,
      req.user.id,
    );
    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
}

export async function getByProject(req, res, next) {
  try {
    const attachments = await attachmentService.getAttachmentsForProject(+req.params.projectId);
    res.json(attachments);
  } catch (error) {
    next(error);
  }
}

export async function getByTask(req, res, next) {
  try {
    const attachments = await attachmentService.getAttachmentsForTask(+req.params.taskId);
    res.json(attachments);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await attachmentService.deleteAttachment(+req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
