import * as projectService from './projects.service.js';

function handleError(error, res) {
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'Un projet avec ces informations existe déjà.' });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }
  return false;
}

export async function create(req, res, next) {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const { status, clientId, search, page, limit } = req.query;
    const result = await projectService.findAll({ status, clientId, search, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const project = await projectService.findById(+req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet introuvable.' });
    const progress = await projectService.getProgress(+req.params.id);
    res.json({ ...project, progress });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const project = await projectService.updateProject(+req.params.id, req.body);
    res.json(project);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await projectService.removeProject(+req.params.id);
    res.status(204).end();
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}
