import * as clientService from './clients.service.js';

// ------------------------------------------------------------
// Gestion centralisée des erreurs métier
// ------------------------------------------------------------
function handleError(error, res, entity = 'client') {
  // Violation de contrainte unique (email, phone, etc.)
  if (error.code === 'P2002') {
    const target = error.meta?.target;
    const champ = target ? target.join(', ') : 'valeur';
    return res.status(409).json({
      message: `Un ${entity} avec ce ${champ} existe déjà.`,
    });
  }

  // Enregistrement introuvable (update, delete)
  if (error.code === 'P2025') {
    return res.status(404).json({
      message: `${entity.charAt(0).toUpperCase() + entity.slice(1)} introuvable.`,
    });
  }

  // Autre erreur → on laisse le middleware global la traiter
  return false;
}

/**
 * GET /clients
 */
export async function getAll(req, res, next) {
  try {
    const { search, sector, page, limit } = req.query;
    const result = await clientService.findAll({ search, sector, page, limit });
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /clients/:id
 */
export async function getOne(req, res, next) {
  try {
    const client = await clientService.findById(+req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client introuvable' });
    }
    return res.json(client);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /clients
 */
export async function create(req, res, next) {
  try {
    const client = await clientService.create(req.body);
    return res.status(201).json(client);
  } catch (error) {
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      const champ = target ? target.join(', ') : 'valeur';
      return res.status(409).json({ message: `Un client avec ce ${champ} existe déjà.` });
    }
    next(error);
  }
}

/**
 * PUT /clients/:id
 */
export async function update(req, res, next) {
  try {
    const client = await clientService.update(+req.params.id, req.body);
    return res.json(client);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /clients/:id
 */
export async function remove(req, res, next) {
  try {
    await clientService.remove(+req.params.id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

/**
 * POST /clients/:id/contacts
 */
export async function addContact(req, res, next) {
  try {
    const contact = await clientService.addContact(+req.params.id, req.body);
    return res.status(201).json(contact);
  } catch (error) {
    if (!handleError(error, res, 'contact')) {
      next(error);
    }
  }
}

/**
 * DELETE /clients/:clientId/contacts/:contactId
 */
export async function removeContact(req, res, next) {
  try {
    await clientService.removeContact(+req.params.contactId);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}
