import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadTemplate(templateName) {
  const filePath = path.join(__dirname, '..', 'templates', 'pdfs', templateName);
  return fs.readFileSync(filePath, 'utf-8');
}

function renderTemplate(templateName, data) {
  let html = loadTemplate(templateName);
  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}

export async function generatePDF(templateName, data) {
  const html = renderTemplate(templateName, data);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdf;
}
