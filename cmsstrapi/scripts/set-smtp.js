'use strict';

// Scrie setările de e-mail din panou („E-mail (SMTP)”), din terminal. E calea prin care
// administratorul tehnic pune prima configurare; după aceea biserica o schimbă singură din panou.
//
//   node scripts/set-smtp.js --host mail.example.org --port 587 \
//     --username noreply@example.org --password '...' \
//     --from-name 'Numele bisericii' --from-email noreply@example.org \
//     --to office@example.org
//
// Argumentele lipsă lasă neatinsă valoarea existentă. Parola trece prin serviciul SMTP, care o
// păstrează criptată (aceeași cale ca butonul din panou); nu se scrie niciodată în clar în bază.

const { createStrapi, compileStrapi } = require('@strapi/strapi');

const UID = 'api::smtp.smtp';

const FIELDS = {
  host: 'host',
  port: 'port',
  secure: 'secure',
  username: 'username',
  password: 'password',
  'from-name': 'fromName',
  'from-email': 'fromEmail',
  to: 'toEmail',
};

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const field = FIELDS[arg.slice(2)];
    if (!field) throw new Error(`Argument necunoscut: ${arg}`);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`Lipsește valoarea pentru ${arg}`);
    i += 1;
    if (field === 'port') out[field] = Number(value);
    else if (field === 'secure') out[field] = value === 'true';
    else if (value !== '') out[field] = value;
  }
  return out;
}

async function main() {
  const { password, ...data } = parseArgs(process.argv.slice(2));
  if (!Object.keys(data).length && password === undefined) {
    console.error('Nimic de setat. Vezi comentariul din capul fișierului.');
    process.exit(1);
  }

  const app = await createStrapi(await compileStrapi()).load();
  const svc = app.service(UID);

  if (Object.keys(data).length) {
    const existing = await app.db.query(UID).findOne({});
    if (existing) await app.db.query(UID).update({ where: { id: existing.id }, data });
    else await app.documents(UID).create({ data });
  }
  if (password !== undefined) await svc.setPassword(password);

  const saved = (await svc.config()) || {};
  const pw = await svc.passwordStatus();
  app.log.info(
    `[smtp] ${saved.host || '(lipsă)'}:${saved.port || '-'} · user ${saved.username || '(lipsă)'} · ` +
      `parolă ${pw.configured ? `setată (${pw.source})` : 'LIPSĂ'} · expeditor ${saved.fromEmail || '(lipsă)'} · ` +
      `destinatar ${saved.toEmail || '(lipsă)'}`,
  );

  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
