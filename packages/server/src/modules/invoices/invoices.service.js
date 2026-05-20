import prisma from '../../lib/prisma.js';

/**
 * Génère une référence de facture unique (ex: FAC-2026-0001)
 */
async function generateReference() {
  const count = await prisma.invoice.count();
  const year = new Date().getFullYear();
  return `FAC-${year}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * Crée une facture (manuelle ou depuis un devis)
 */
export async function createInvoice(data) {
  const { clientId, quoteId, dueDate, items } = data;

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

  return prisma.invoice.create({
    data: {
      reference,
      clientId,
      quoteId: quoteId || null,
      dueDate: new Date(dueDate),
      totalHT,
      totalTTC,
      status: 'draft',
      items: { create: processedItems },
    },
    include: {
      items: true,
      client: { select: { id: true, name: true, email: true } }, // ← inclure le client
      payments: true,
    },
  });
}

/**
 * Récupère toutes les factures avec filtres
 */
export async function findAll({ status, clientId, search, page = '1', limit = '20' }) {
  const where = {};
  if (status) where.status = status;
  if (clientId) where.clientId = parseInt(clientId, 10);
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        items: true,
        payments: true,
        client: { select: { id: true, name: true } },
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.count({ where }),
  ]);

  return { invoices, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
}

/**
 * Récupère une facture par ID
 */
export async function findById(id) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
      client: { select: { id: true, name: true, email: true } }, // <-- cette ligne est cruciale
      quote: true,
    },
  });
}

/**
 * Ajoute un paiement à une facture
 */
export async function addPayment(invoiceId, paymentData) {
  // Vérifier que la facture existe
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    const error = new Error('Facture introuvable');
    error.code = 'P2025'; // code reconnu par notre gestionnaire d'erreur
    throw error;
  }

  const payment = await prisma.payment.create({
    data: {
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference || null,
      date: paymentData.date ? new Date(paymentData.date) : new Date(),
      invoiceId,
    },
  });

  await updateInvoiceStatus(invoiceId);
  return payment;
}
/**
 * Met à jour le statut d'une facture en fonction des paiements
 */
async function updateInvoiceStatus(invoiceId) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

  let newStatus = invoice.status;
  if (totalPaid >= invoice.totalTTC) {
    newStatus = 'paid';
  } else if (totalPaid > 0) {
    newStatus = 'partially_paid';
  } else if (new Date() > invoice.dueDate) {
    newStatus = 'overdue';
  }

  if (newStatus !== invoice.status) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });
  }
}

/**
 * Supprime une facture
 */
export async function removeInvoice(id) {
  return prisma.invoice.delete({ where: { id } });
}

/**
 * Récupère le solde dû d'une facture
 */
export async function getBalance(invoiceId) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!invoice) return null;
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  return {
    totalTTC: invoice.totalTTC,
    totalPaid,
    balance: invoice.totalTTC - totalPaid,
  };
}
