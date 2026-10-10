'use strict';

// Retrimite invitația unui coleg care încă n-a intrat, sau doar arată linkul. Același lucru se
// poate face din panou (Setări → Site → Invitații); scriptul e pentru când nu poți intra acolo.
// Nu regenerează tokenul — linkul rămâne același.
//
//   node scripts/resend-invitation.js                       # lista invitațiilor în așteptare
//   node scripts/resend-invitation.js --link adresa@ex.ro   # doar arată linkul, nu trimite
//   node scripts/resend-invitation.js --send adresa@ex.ro   # trimite invitația pe e-mail

const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { sendInvitation, receipt, registerUrl } = require('../src/invitations');

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--send') ? 'send' : args.includes('--link') ? 'link' : 'list';
  const email = args[args.indexOf(mode === 'send' ? '--send' : '--link') + 1];

  const app = await createStrapi(await compileStrapi()).load();
  const done = async (code) => {
    await app.destroy();
    process.exit(code);
  };

  if (mode === 'list') {
    const pending = (await app.db.query('admin::user').findMany({ where: { isActive: false } })).filter((u) => u.registrationToken);
    if (!pending.length) app.log.info('[invitații] nicio invitație în așteptare.');
    for (const u of pending) app.log.info(`[invitații] în așteptare: ${u.email} (creat ${u.createdAt})`);
    return done(0);
  }

  const user = email ? await app.db.query('admin::user').findOne({ where: { email } }) : null;
  if (!user) {
    app.log.error(`[invitații] nu există cont pentru ${email || '(adresă lipsă)'}`);
    return done(1);
  }
  if (!user.registrationToken) {
    app.log.error(`[invitații] ${email} nu are token — contul e deja activ.`);
    return done(1);
  }

  if (mode === 'link') {
    app.log.info(`[invitații] link pentru ${email}:\n${registerUrl(app, user.registrationToken)}`);
  } else {
    const { info } = await sendInvitation(app, user);
    app.log.info(`[invitații] invitație trimisă către ${email} — ${receipt(info)}`);
  }
  return done(0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
