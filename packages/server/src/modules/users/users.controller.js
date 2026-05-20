import * as usersService from './users.service.js';

export async function getAll(req, res, next) {
  try {
    const users = await usersService.findAll();
    res.json({ users });
  } catch (error) {
    next(error);
  }
}
