import { Router } from 'express';
import { createQuoteSchema, updateQuoteStatusSchema } from '@nexusflow/shared';
import * as quoteController from './quotes.controller.js';
import * as quoteService from './quotes.service.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendQuoteEmail } from '../../utils/mailer.js';
import { generatePDF } from '../../utils/pdfGenerator.js';

const router = Router();
router.use(authenticate);

router.get('/', quoteController.getAll);
router.get('/:id', quoteController.getOne);
router.post(
  '/',
  authorize('admin', 'manager', 'commercial'),
  validate(createQuoteSchema),
  quoteController.create,
);
router.patch(
  '/:id/status',
  authorize('admin', 'manager'),
  validate(updateQuoteStatusSchema),
  quoteController.updateStatus,
);
router.delete('/:id', authorize('admin'), quoteController.remove);

router.post('/:id/send', authorize('admin', 'manager', 'commercial'), async (req, res, next) => {
  try {
    const quote = await quoteService.findById(+req.params.id);
    if (!quote) return res.status(404).json({ message: 'Devis introuvable.' });

    // Utiliser l'email fourni ou celui du client
    const to = req.body.email || quote.client?.email;
    if (!to) return res.status(400).json({ message: 'Aucune adresse email disponible.' });

    await sendQuoteEmail(to, quote);
    res.json({ message: `Devis envoyé par email à ${to}.` });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const quote = await quoteService.findById(+req.params.id);
    if (!quote) return res.status(404).json({ message: 'Devis introuvable.' });

    const pdf = await generatePDF('quote.html', {
      reference: quote.reference,
      clientName: quote.client?.name || 'N/A',
      date: new Date(quote.createdAt).toLocaleDateString('fr-FR'),
      totalHT: quote.totalHT.toFixed(2),
      totalTTC: quote.totalTTC.toFixed(2),
      validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('fr-FR') : 'N/A',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=devis-${quote.reference}.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

export default router;
