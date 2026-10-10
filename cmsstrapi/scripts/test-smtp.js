'use strict';

// Verifică configurarea de e-mail din panou, fără browser. Butonul din CMS face același lucru, dar
// are nevoie de o sesiune de administrator; ăsta merge din shell, util când nu poți intra în panou.
//
//   node scripts/test-smtp.js                        # doar conexiunea + autentificarea
//   node scripts/test-smtp.js --send adresa@exemplu.ro
//
// Trimiterea trece prin plugin-ul de e-mail, adică exact pe drumul pe care merg și linkul de
// resetare a parolei și invitațiile — dacă mesajul ajunge, ajung și ele.

const { createStrapi, compileStrapi } = require('@strapi/strapi');

async function main() {
  const args = process.argv.slice(2);
  const sendAt = args.indexOf('--send');
  const recipient = sendAt !== -1 ? args[sendAt + 1] : null;

  const app = await createStrapi(await compileStrapi()).load();
  const svc = app.service('api::smtp.smtp');

  const cfg = (await svc.config()) || {};
  const pw = await svc.passwordStatus();
  app.log.info(
    `[smtp] panou: ${cfg.host || '(lipsă)'}:${cfg.port || '-'} · user ${cfg.username || '(lipsă)'} · ` +
      `parolă ${pw.configured ? `setată (${pw.source})` : 'LIPSĂ'} · expeditor ${cfg.fromEmail || cfg.username || '(lipsă)'} · ` +
      `destinatar ${cfg.toEmail || '(lipsă)'}`,
  );
  if (!cfg.host) {
    app.log.error('[smtp] host lipsă: completează „E-mail (SMTP)” în panou sau rulează scripts/set-smtp.js.');
    await app.destroy();
    process.exit(1);
  }

  try {
    await (await svc.transporter(cfg)).verify();
    app.log.info('[smtp] conexiune + autentificare: OK');
  } catch (err) {
    app.log.error(`[smtp] conexiune: EȘEC — ${err.message}`);
    await app.destroy();
    process.exit(1);
  }

  if (recipient) {
    await app
      .plugin('email')
      .service('email')
      .send({
        to: recipient,
        subject: `Test SMTP — ${cfg.fromName || 'site'}`,
        text: 'Test trimis din linia de comandă, pe același drum ca linkul de resetare a parolei și invitațiile.',
      });
    app.log.info(`[smtp] mesaj de test trimis către ${recipient}`);
  }

  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
