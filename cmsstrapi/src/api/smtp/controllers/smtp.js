'use strict';

const jwt = require('jsonwebtoken');

// Verifică că cererea vine de la un admin autentificat în panou (JWT admin în header).
function isAdmin(strapi, ctx) {
  const header = ctx.request.header.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return false;
  try {
    jwt.verify(token, strapi.config.get('admin.auth.secret'));
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  // Formular de contact — apelat DOAR server-side de Next, autentificat cu tokenul intern.
  async send(ctx) {
    const secret = process.env.MAIL_PROXY_TOKEN;
    if (!secret || ctx.request.header['x-mail-token'] !== secret) {
      return ctx.unauthorized();
    }

    const { firstName, lastName, email, phone, text } = ctx.request.body || {};
    if (!firstName || !lastName || !email || !text) {
      return ctx.badRequest('Câmpuri obligatorii lipsă.');
    }

    const name = `${firstName} ${lastName}`.trim();
    const svc = strapi.service('api::smtp.smtp');
    try {
      await svc.send({
        subject: `Mesaj nou de la ${name}`,
        replyTo: email,
        ...svc.contactBody({ name, email, phone, text }),
      });
      ctx.body = { ok: true };
    } catch (err) {
      strapi.log.error(`smtp.send: ${err.message}`);
      return ctx.internalServerError('Trimiterea a eșuat.');
    }
  },

  // Salvează parola SMTP din panou. Nu întoarce NICIODATĂ valoarea — doar confirmarea.
  async setPassword(ctx) {
    if (!isAdmin(strapi, ctx)) return ctx.unauthorized();
    const { password } = ctx.request.body || {};
    if (password !== '' && (typeof password !== 'string' || !password.trim())) {
      return ctx.badRequest('Parolă invalidă.');
    }
    try {
      const res = await strapi.service('api::smtp.smtp').setPassword(password.trim());
      strapi.log.info(`smtp: parola ${res.configured ? 'actualizată' : 'ștearsă'} din panou.`);
      ctx.body = { ok: true, ...res };
    } catch (err) {
      strapi.log.error(`smtp.setPassword: ${err.message}`);
      ctx.body = { ok: false, error: err.message };
    }
  },

  // Starea parolei pentru panou: configurată sau nu (+ când) — niciodată valoarea.
  async passwordStatus(ctx) {
    if (!isAdmin(strapi, ctx)) return ctx.unauthorized();
    ctx.body = await strapi.service('api::smtp.smtp').passwordStatus();
  },

  // Buton „Trimite e-mail de test” din CMS — trimite o probă la adresa configurată (toEmail).
  async test(ctx) {
    if (!isAdmin(strapi, ctx)) return ctx.unauthorized();

    const svc = strapi.service('api::smtp.smtp');
    try {
      const cfg = await svc.config();
      if (!cfg || !cfg.host) {
        ctx.body = { ok: false, error: 'Completează întâi setările SMTP și apasă Save, apoi testează.' };
        return;
      }
      const brand = cfg.fromName || 'site';
      await svc.send({
        subject: `Test SMTP — ${brand}`,
        text: 'Acesta este un e-mail de test trimis din panoul de administrare. Dacă îl vezi, configurarea SMTP funcționează corect.',
        html:
          '<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;color:#17222e">' +
          '<h2 style="color:#c0351b;margin:0 0 8px">Test SMTP reușit ✔</h2>' +
          `<p>Acesta este un e-mail de test trimis din panoul de administrare (${brand}).<br>` +
          'Dacă îl vezi, configurarea SMTP funcționează corect și formularul de contact va livra mesajele.</p></div>',
      });
      ctx.body = { ok: true, to: cfg.toEmail };
    } catch (err) {
      // Întoarcem mesajul de eroare (nu aruncăm) ca panoul să-l afișeze clar.
      ctx.body = { ok: false, error: err.message };
    }
  },
};
