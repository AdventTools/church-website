'use strict';

// Strapi NU trimite e-mail la invitarea unui coleg — nici în ediția gratuită, nici în cea plătită.
// Creează contul cu un token de înregistrare și îți arată un link pe care trebuie să-l copiezi și
// să-l trimiți tu, pe alt canal. Când conturile le face cineva care nu stă în terminal, invitația
// se pierde: contul rămâne inactiv și omul nu află niciodată.
//
// Trimitem noi linkul, pe aceleași setări SMTP din panou ca resetarea parolei.
// Doar pentru invitații reale: `admin:create-user` din linia de comandă face conturi active, cu
// parolă știută, fără token — acelea nu primesc nimic.

const REGISTER_PATH = '/auth/register?registrationToken=';

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Numele bisericii vine din panou („Informații biserică”), ca invitația să poarte numele ei.
async function churchName(strapi) {
  try {
    const info = await strapi.db.query('api::church-info.church-info').findOne({ where: { locale: 'ro' } });
    if (info && info.churchName) return info.churchName;
  } catch {
    /* tipul lipsește sau baza nu răspunde: mesajul pleacă fără nume */
  }
  return '';
}

function invitationEmail({ url, church }) {
  const site = church ? `site-ului ${church}` : 'site-ului bisericii';
  return {
    subject: church ? `Invitație în panoul de administrare — ${church}` : 'Invitație în panoul de administrare',
    text: `Ai fost invitat să administrezi conținutul ${site}.

Deschide linkul de mai jos ca să-ți alegi o parolă și să intri:

${url}

Dacă nu te așteptai la această invitație, ignoră mesajul — contul rămâne neactivat.`,
    html: `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;color:#17222e;line-height:1.6">
  <h2 style="margin:0 0 12px">Invitație în panoul de administrare</h2>
  <p style="margin:0 0 16px">Ai fost invitat să administrezi conținutul ${escapeHtml(site)}.</p>
  <p style="margin:0 0 20px">
    <a href="${url}" style="display:inline-block;padding:12px 22px;background:#17222e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Alege-ți parola și intră</a>
  </p>
  <p style="margin:0 0 16px;font-size:13px;color:#5b6b7a">Dacă butonul nu funcționează, copiază adresa aceasta în browser:<br><span style="word-break:break-all">${url}</span></p>
  <p style="margin:0;font-size:13px;color:#5b6b7a">Dacă nu te așteptai la această invitație, ignoră mesajul — contul rămâne neactivat.</p>
</div>`,
  };
}

const registerUrl = (strapi, token) => `${strapi.config.get('admin.absoluteUrl')}${REGISTER_PATH}${token}`;

// Trimite invitația pentru un cont deja creat. Folosit și de `scripts/resend-invitation.js`.
async function sendInvitation(strapi, user) {
  if (!user || !user.registrationToken) {
    throw new Error(`${user && user.email} nu are token de înregistrare (contul e deja activ?).`);
  }
  const url = registerUrl(strapi, user.registrationToken);
  const info = await strapi
    .plugin('email')
    .service('email')
    .send({ to: user.email, ...invitationEmail({ url, church: await churchName(strapi) }) });
  return { url, info };
}

// Chitanța de la serverul de mail: ce a răspuns și ce identificator a dat mesajului. Fără ea,
// „s-a trimis” înseamnă doar „nu a crăpat” — iar când omul spune că n-a primit nimic, n-ai cu ce
// să distingi un mesaj respins de unul ajuns în spam.
function receipt(info) {
  if (!info) return '';
  const accepted = (info.accepted || []).join(', ');
  const rejected = (info.rejected || []).join(', ');
  return [
    accepted && `acceptat pentru ${accepted}`,
    rejected && `RESPINS pentru ${rejected}`,
    info.response && `răspuns server: ${info.response}`,
    info.messageId && `id: ${info.messageId}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

function registerInvitationEmails(strapi) {
  strapi.db.lifecycles.subscribe({
    models: ['admin::user'],
    async afterCreate(event) {
      const user = event.result;
      // Conturile făcute din linia de comandă sunt active și fără token — nu sunt invitații.
      if (!user || !user.registrationToken || user.isActive) return;
      try {
        const { info } = await sendInvitation(strapi, user);
        strapi.log.info(`Invitație trimisă către ${user.email} — ${receipt(info)}`);
      } catch (err) {
        // Nu aruncăm: contul e creat, iar panoul afișează oricum linkul de copiat. Dar spunem
        // limpede în log că invitația n-a plecat, altfel pare că a ajuns.
        strapi.log.error(`Invitația către ${user.email} NU a plecat: ${err.message}`);
      }
    },
  });
}

module.exports = { registerInvitationEmails, sendInvitation, receipt, registerUrl };
