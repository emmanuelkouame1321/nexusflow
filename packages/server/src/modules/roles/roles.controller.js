import * as rolesService from './roles.service.js';

export async function getAll(req, res, next) {
  try {
    const roles = await rolesService.findAll();
    res.json({ roles });
  } catch (error) {
    next(error);
  }
}
