import prisma from '../../lib/prisma.js';

// Récupère tous les paramètres sous forme d'objet { key: value }
export async function getAll() {
  const settings = await prisma.setting.findMany();
  const result = {};
  settings.forEach((s) => {
    result[s.key] = s.value;
  });
  return result;
}

// Met à jour ou crée un paramètre
export async function set(key, value) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
