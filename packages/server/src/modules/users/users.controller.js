import * as usersService from './users.service.js';

function handleError(error, res) {
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Utilisateur introuvable.' });
  }
  return false;
}

export async function getAll(req, res, next) {
  try {
    const users = await usersService.findAll();
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const user = await usersService.create(req.body);
    res.status(201).json({ user });
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function update(req, res, next) {
  try {
    const user = await usersService.update(+req.params.id, req.body);
    res.json({ user });
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await usersService.remove(+req.params.id);
    res.status(204).end();
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}
