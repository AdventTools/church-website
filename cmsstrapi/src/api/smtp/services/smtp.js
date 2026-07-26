'use strict';

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { createCoreService } = require('@strapi/strapi').factories;

const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// --- Parola SMTP: setabilă din panou, dar NICIODATĂ afișată ------------------------------
// Se păstrează criptată (AES-256-GCM) în core-store, nu într-un câmp de content-type: câmpurile
// `type: password` din Strapi 5 sunt hash-uite bcrypt (irecuperabile), deci inutilizabile pentru
// autentificare SMTP. Cheia de criptare se derivă din ADMIN_JWT_SECRET (env, niciodată în git),
// așa că un dump de bază de date nu dezvăluie parola. Nicio rută nu întoarce vreodată valoarea.
const PW_STORE = { type: 'plugin', name: 'smtp-cms' };
const PW_KEY = 'password';

function cryptoKey() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET lipsește — nu pot cripta parola SMTP.');
  return crypto.scryptSync(secret, 'smtp-password-v1', 32);
}

function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', cryptoKey(), iv);
  const enc = Buffer.concat([c.update(String(plain), 'utf8'), c.final()]);
  return `v1:${iv.toString('base64')}:${c.getAuthTag().toString('base64')}:${enc.toString('base64')}`;
}

function decrypt(blob) {
  const [v, iv, tag, data] = String(blob).split(':');
  if (v !== 'v1') throw new Error('format necunoscut');
  const d = crypto.createDecipheriv('aes-256-gcm', cryptoKey(), Buffer.from(iv, 'base64'));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(data, 'base64')), d.final()]).toString('utf8');
}

module.exports = createCoreService('api::smtp.smtp', ({ strapi }) => ({
  // Config-ul din CMS (fără parolă — aceea stă criptată separat).
  async config() {
    return strapi.db.query('api::smtp.smtp').findOne({});
  },

  // Salvează parola nouă (criptată). Șir gol => șterge parola stocată.
  async setPassword(plain) {
    const store = strapi.store(PW_STORE);
    if (!plain) {
      await store.set({ key: PW_KEY, value: null });
      return { configured: false };
    }
    await store.set({ key: PW_KEY, value: { enc: encrypt(plain), updatedAt: new Date().toISOString() } });
    return { configured: true };
  },

  // Parola în clar, DOAR pentru uz intern la trimitere. Fallback pe env în timpul tranziției.
  async getPassword() {
    try {
      const rec = await strapi.store(PW_STORE).get({ key: PW_KEY });
      if (rec && rec.enc) return decrypt(rec.enc);
    } catch (e) {
      strapi.log.error(`smtp.getPassword: ${e.message}`);
    }
    return process.env.SMTP_PASSWORD || '';
  },

  // Pentru panou: dacă e configurată și când a fost schimbată — niciodată valoarea.
  async passwordStatus() {
    const rec = await strapi.store(PW_STORE).get({ key: PW_KEY });
    if (rec && rec.enc) return { configured: true, source: 'cms', updatedAt: rec.updatedAt || null };
    if (process.env.SMTP_PASSWORD) return { configured: true, source: 'env', updatedAt: null };
    return { configured: false, source: null, updatedAt: null };
  },

  async transporter(cfg) {
    const port = Number(cfg.port) || 587;
    // 465 = TLS implicit; 587 = STARTTLS. Pentru porturile standard deducem modul din port
    // (mai robust decât bifa „secure”, ușor de greșit); altfel respectăm bifa din CMS.
    const secure = port === 465 ? true : port === 587 ? false : !!cfg.secure;
    const pass = await this.getPassword();
    return nodemailer.createTransport({
      host: cfg.host,
      port,
      secure,
      ...(port === 587 ? { requireTLS: true } : {}),
      ...(cfg.username ? { auth: { user: cfg.username, pass } } : {}),
    });
  },

  // Trimite un e-mail folosind setările din CMS. Aruncă eroare clară dacă nu e configurat.
  async send({ subject, text, html, replyTo, to, from }) {
    const cfg = await this.config();
    if (!cfg || !cfg.host) throw new Error('SMTP neconfigurat. Completează host-ul în CMS și salvează.');
    const recipient = to || cfg.toEmail;
    if (!recipient) throw new Error('Lipsește adresa destinatar (toEmail) în setările SMTP.');

    const fromAddr = cfg.fromEmail || cfg.username;
    const fromHeader = from || (cfg.fromName ? `"${cfg.fromName}" <${fromAddr}>` : fromAddr);

    const tx = await this.transporter(cfg);
    return tx.sendMail({ from: fromHeader, to: recipient, replyTo, subject, text, html });
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
