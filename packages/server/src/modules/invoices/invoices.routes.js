import { Router } from 'express';
import { createInvoiceSchema, addPaymentSchema } from '@nexusflow/shared';
import * as invoiceController from './invoices.controller.js';
import * as invoiceService from './invoices.service.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendInvoiceEmail, sendReminderEmail } from '../../utils/mailer.js';
import { generatePDF } from '../../utils/pdfGenerator.js';

const router = Router();
router.use(authenticate);

function getEmail(req, invoice) {
  // Si un email est fourni dans la requête, l'utiliser
  if (req.body.email) return req.body.email;
  // Sinon, essayer de récupérer l'email du client, mais vérifier que le client existe
  if (invoice.client?.email) return invoice.client.email;
  // Si rien n'est trouvé, retourner null
  return null;
}

// --- CRUD de base ---
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getOne);
router.post(
  '/',
  authorize('admin', 'manager', 'commercial'),
  validate(createInvoiceSchema),
  invoiceController.create,
);
router.post(
  '/:id/payments',
  authorize('admin', 'manager', 'commercial'),
  validate(addPaymentSchema),
  invoiceController.addPayment,
);
router.get('/:id/balance', invoiceController.getBalance);
router.delete('/:id', authorize('admin'), invoiceController.remove);

// --- Envoi par email ---
// Envoi de la facture par email
router.post('/:id/send', authorize('admin', 'manager', 'commercial'), async (req, res, next) => {
  try {
    const invoice = await invoiceService.findById(+req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Facture introuvable.' });

    const to = req.body.email || (invoice.client && invoice.client.email);
    if (!to)
      return res
        .status(400)
        .json({ message: 'Aucune adresse email disponible pour cette facture.' });

    // 🔍 Logs de debug
    console.log('───── Envoi facture ─────');
    console.log(
      'Email fourni (req.body.email) :',
      req.body.email,
      `(type: ${typeof req.body.email})`,
    );
    console.log(
      'Email client (BDD)           :',
      invoice.client?.email,
      `(type: ${typeof invoice.client?.email})`,
    );
    console.log('Destinataire final           :', to, `(type: ${typeof to})`);
    console.log('Sujet                        :', `Facture ${invoice.reference}`);
    console.log('Référence                    :', invoice.reference);
    console.log('Montant TTC                  :', invoice.totalTTC);
    console.log('Client                       :', invoice.client?.name);
    console.log('─────────────────────────');

    await sendInvoiceEmail(to, invoice);
    res.json({ message: `Facture envoyée par email à ${to}.` });
  } catch (error) {
    next(error);
  }
});

// Relance par email
router.post('/:id/remind', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const invoice = await invoiceService.findById(+req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Facture introuvable.' });

    const to = req.body.email || (invoice.client && invoice.client.email);
    if (!to)
      return res
        .status(400)
        .json({ message: 'Aucune adresse email disponible pour cette facture.' });

    const balance = await invoiceService.getBalance(invoice.id);

    // 🔍 Logs de debug
    console.log('───── Relance facture ─────');
    console.log(
      'Email fourni (req.body.email) :',
      req.body.email,
      `(type: ${typeof req.body.email})`,
    );
    console.log(
      'Email client (BDD)           :',
      invoice.client?.email,
      `(type: ${typeof invoice.client?.email})`,
    );
    console.log('Destinataire final           :', to, `(type: ${typeof to})`);
    console.log('Sujet                        :', `Relance facture ${invoice.reference}`);
    console.log('Référence                    :', invoice.reference);
    console.log('Solde dû                     :', balance.balance);
    console.log('Client                       :', invoice.client?.name);
    console.log('──────────────────────────');

    await sendReminderEmail(to, invoice, balance.balance);
    res.json({ message: `Relance envoyée par email à ${to}.` });
  } catch (error) {
    next(error);
  }
});

// --- Téléchargement PDF ---
router.get('/:id/pdf', async (req, res, next) => {
  try {
    const invoice = await invoiceService.findById(+req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Facture introuvable.' });

    const pdf = await generatePDF('invoice.html', {
      reference: invoice.reference,
      clientName: invoice.client?.name || 'N/A',
      date: new Date(invoice.createdAt).toLocaleDateString('fr-FR'),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'N/A',
      totalHT: invoice.totalHT.toFixed(2),
      totalTTC: invoice.totalTTC.toFixed(2),
      status: invoice.status,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${invoice.reference}.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

export default router;
