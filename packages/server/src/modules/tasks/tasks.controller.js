import * as taskService from './tasks.service.js';

function handleError(error, res) {
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'Une tâche avec ces informations existe déjà.' });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Tâche introuvable.' });
  }
  return false;
}

export async function create(req, res, next) {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const task = await taskService.findById(+req.params.id);
    if (!task) return res.status(404).json({ message: 'Tâche introuvable.' });
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const task = await taskService.updateTask(+req.params.id, req.body);
    res.json(task);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await taskService.removeTask(+req.params.id);
    res.status(204).end();
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const comment = await taskService.addComment(+req.params.id, req.user.id, req.body.text);
    res.status(201).json(comment);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function addDependency(req, res, next) {
  try {
    const dep = await taskService.addDependency(+req.params.id, req.body.dependsOnTaskId);
    res.status(201).json(dep);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function removeDependency(req, res, next) {
  try {
    await taskService.removeDependency(+req.params.depId);
    res.status(204).end();
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}
