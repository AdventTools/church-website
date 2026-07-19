'use strict';

const nodemailer = require('nodemailer');
const { createCoreService } = require('@strapi/strapi').factories;

const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

module.exports = createCoreService('api::smtp.smtp', ({ strapi }) => ({
  // Config-ul complet, INCLUSIV parola — citit direct din DB (nesanitizat), niciodată expus prin API public.
  async config() {
    return strapi.db.query('api::smtp.smtp').findOne({});
  },

  transporter(cfg) {
    const port = Number(cfg.port) || 587;
    // 465 = TLS implicit; 587 = STARTTLS. Pentru porturile standard deducem modul din port
    // (mai robust decât bifa „secure”, ușor de greșit); altfel respectăm bifa din CMS.
    const secure = port === 465 ? true : port === 587 ? false : !!cfg.secure;
    // Parola vine DIN env (server-only, gitignored), niciodată din CMS/DB/API.
    const pass = process.env.SMTP_PASSWORD || cfg.password;
    return nodemailer.createTransport({
      host: cfg.host,
      port,
      secure,
      ...(port === 587 ? { requireTLS: true } : {}),
      ...(cfg.username ? { auth: { user: cfg.username, pass } } : {}),
    });
  },

  // Trimite un e-mail folosind setările din CMS. Aruncă eroare clară dacă nu e configurat.
  async send({ subject, text, html, replyTo, to }) {
    const cfg = await this.config();
    if (!cfg || !cfg.host) throw new Error('SMTP neconfigurat. Completează host-ul în CMS și salvează.');
    const recipient = to || cfg.toEmail;
    if (!recipient) throw new Error('Lipsește adresa destinatar (toEmail) în setările SMTP.');

    const fromAddr = cfg.fromEmail || cfg.username;
    const from = cfg.fromName ? `"${cfg.fromName}" <${fromAddr}>` : fromAddr;

    return this.transporter(cfg).sendMail({ from, to: recipient, replyTo, subject, text, html });
  },

  // Construiește corpul (text + html) pentru un mesaj din formularul de contact.
  contactBody({ name, email, phone, text }) {
    const plain = `Nume: ${name}\nE-mail: ${email}\nTelefon: ${phone || '-'}\n\n${text}`;
    const html = `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;color:#17222e;line-height:1.6">
        <h2 style="margin:0 0 12px;color:#c0351b">Mesaj nou de pe formularul de contact</h2>
        <p style="margin:0 0 4px"><strong>Nume:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 4px"><strong>E-mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p style="margin:0 0 12px"><strong>Telefon:</strong> ${escapeHtml(phone || '-')}</p>
        <div style="padding:14px 16px;background:#f6f7f9;border-left:3px solid #c0351b;border-radius:6px;white-space:pre-wrap">${escapeHtml(text)}</div>
      </div>`;
    return { text: plain, html };
  },
}));
