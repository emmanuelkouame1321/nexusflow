import prisma from '../../lib/prisma.js';

/**
 * Génère une référence unique pour un devis.
 */
async function generateReference() {
  const count = await prisma.quote.count();
  const year = new Date().getFullYear();
  return `DEV-${year}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * Crée un devis avec ses lignes.
 */
export async function createQuote(data) {
  const { clientId, validUntil, items } = data;

  // Calcul des totaux
  let totalHT = 0;
  let totalTTC = 0;
  const processedItems = items.map((item) => {
    const lineHT = item.quantity * item.unitPrice * (1 - item.discount / 100);
    const lineTTC = lineHT * (1 + item.taxRate / 100);
    totalHT += lineHT;
    totalTTC += lineTTC;
    return {
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      taxRate: item.taxRate || 0,
      productId: item.productId || null,
    };
  });

  const reference = await generateReference();

  return prisma.quote.create({
    data: {
      reference,
      clientId,
      validUntil: validUntil ? new Date(validUntil) : null,
      totalHT,
      totalTTC,
      items: { create: processedItems },
    },
    include: {
      items: true,
      client: true,
    },
  });
}

/**
 * Récupère tous les devis avec filtres.
 */
export async function findAll({ status, clientId, page = '1', limit = '20' }) {
  const where = {};
  if (status) where.status = status;
  if (clientId) where.clientId = parseInt(clientId, 10);

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        items: true,
        client: { select: { id: true, name: true } },
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quote.count({ where }),
  ]);

  return { quotes, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
}

/**
 * Récupère un devis par ID.
 */
export async function findById(id) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      items: true,
      client: true,
    },
  });
}

/**
 * Met à jour le statut d'un devis.
 */
export async function updateStatus(id, status) {
  return prisma.quote.update({
    where: { id },
    data: { status },
    include: { items: true, client: true },
  });
}

/**
 * Supprime un devis.
 */
export async function removeQuote(id) {
  return prisma.quote.delete({ where: { id } });
}
