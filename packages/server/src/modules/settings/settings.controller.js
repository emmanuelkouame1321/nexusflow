import * as settingsService from './settings.service.js';

export async function getAll(req, res, next) {
  try {
    const settings = await settingsService.getAll();
    res.json(settings);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Clé et valeur requises.' });
    }
    await settingsService.set(key, value);
    res.json({ message: 'Paramètre mis à jour.' });
  } catch (error) {
    next(error);
  }
}
