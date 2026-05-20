import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import env from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter;

// Créer le transporteur : Brevo si configuré, sinon Ethereal
async function createTransporter() {
  if (env.smtp.host && env.smtp.user && env.smtp.pass) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
    console.log('📧 SMTP configuré :', env.smtp.host);
    return;
  }

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log('📧 Compte Ethereal créé :', testAccount.user);
}

let initPromise = null;
function ensureInit() {
  if (!initPromise) initPromise = createTransporter();
  return initPromise;
}

// Charger un template HTML
function loadTemplate(templateName) {
  const filePath = path.join(__dirname, '..', 'templates', 'emails', templateName);
  return fs.readFileSync(filePath, 'utf-8');
}

// Remplacer les variables dans un template
function renderTemplate(templateName, data) {
  let html = loadTemplate(templateName);
  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}

// Envoyer un email générique
export async function sendMail({ to, subject, html }) {
  await ensureInit();
  const info = await transporter.sendMail({
    from: env.smtp.from || 'noreply@nexusflow.dev',
    to,
    subject,
    html,
  });
  console.log('Message ID :', info.messageId);
  // Vérifier si on utilise Ethereal ou un vrai service
  const isEthereal = transporter.options.host === 'smtp.ethereal.email';
  if (isEthereal) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Aperçu Ethereal :', previewUrl);
    } else {
      console.log(
        'Consultez vos emails sur https://ethereal.email avec les identifiants affichés au démarrage.',
      );
    }
  } else {
    console.log(`Email envoyé avec succès à ${to} via ${env.smtp.host}`);
  }
}

// Envoyer un devis par email
export async function sendQuoteEmail(to, quote) {
  const html = renderTemplate('quote-sent.html', {
    reference: quote.reference,
    totalTTC: quote.totalTTC.toFixed(2),
    validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('fr-FR') : 'N/A',
  });
  return sendMail({ to, subject: `Devis ${quote.reference}`, html });
}

// Envoyer une facture par email
export async function sendInvoiceEmail(to, invoice) {
  const html = renderTemplate('invoice-sent.html', {
    reference: invoice.reference,
    totalTTC: invoice.totalTTC.toFixed(2),
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'N/A',
  });
  return sendMail({ to, subject: `Facture ${invoice.reference}`, html });
}

// Envoyer une relance par email
export async function sendReminderEmail(to, invoice, balance) {
  const html = renderTemplate('reminder.html', {
    reference: invoice.reference,
    totalTTC: invoice.totalTTC.toFixed(2),
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'N/A',
    balance: balance.toFixed(2),
  });
  return sendMail({ to, subject: `Relance facture ${invoice.reference}`, html });
}
