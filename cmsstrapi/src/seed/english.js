'use strict';

// Creează versiunile EN ale conținutului, LEGATE de cele RO (relația localizations),
// copiind câmpurile partajate (media/linkuri/ore) din RO. Idempotent: sare dacă EN există deja.
// Sursa traducerilor: ./en.json (generat cu workflow-ul de traducere).

const fs = require('fs');
const path = require('path');

function mediaFields(model) {
  return Object.entries(model.attributes)
    .filter(([, a]) => a.type === 'media')
    .map(([name]) => name);
}

// entityService.create acceptă id-uri pentru relații media, nu obiecte populate.
function normalizeMedia(model, body) {
  for (const f of mediaFields(model)) {
    const v = body[f];
    if (Array.isArray(v)) body[f] = v.map((x) => (x && x.id ? x.id : x)).filter(Boolean);
    else if (v && typeof v === 'object' && v.id) body[f] = v.id;
  }
}

async function addLocalization(strapi, uid, roEntry, enData) {
  if (!roEntry) return 'no-ro';
  if ((roEntry.localizations || []).some((l) => l.locale === 'en')) return 'exists';

  const ctSvc = strapi.plugin('i18n').service('content-types');
  const locSvc = strapi.plugin('i18n').service('localizations');
  const model = strapi.getModel(uid);

  const body = { ...enData, locale: 'en' };
  ctSvc.fillNonLocalizedAttributes(body, roEntry, { model: uid });
  normalizeMedia(model, body);
  body.localizations = [roEntry.id, ...(roEntry.localizations || []).map((l) => l.id)];
  if (strapi.getModel(uid).options?.draftAndPublish !== false) body.publishedAt = new Date();

  const created = await strapi.entityService.create(uid, { data: body, populate: ['localizations'] });
  await locSvc.syncLocalizations(created, { model });
  return `created:${created.id}`;
}

async function getRoSingle(strapi, uid) {
  const model = strapi.getModel(uid);
  const populate = { localizations: true };
  for (const f of mediaFields(model)) populate[f] = true;
  const rows = await strapi.entityService.findMany(uid, { populate, locale: 'ro' });
  return Array.isArray(rows) ? rows[0] : rows;
}

async function getRoCollection(strapi, uid) {
  const model = strapi.getModel(uid);
  const populate = { localizations: true };
  for (const f of mediaFields(model)) populate[f] = true;
  return strapi.entityService.findMany(uid, { populate, locale: 'ro', pagination: { limit: 200 } });
}

module.exports = async function seedEnglish(strapi) {
  const file = path.join(__dirname, 'en.json');
  if (!fs.existsSync(file)) {
    strapi.log.warn('seedEnglish: en.json lipsește, sar peste.');
    return;
  }
  const en = JSON.parse(fs.readFileSync(file, 'utf8'));
  const log = [];

  const SINGLES = [
    ['api::church-info.church-info', en.church],
    ['api::home-page.home-page', en.home],
    ['api::contact.contact', en.contact],
    ['api::gallery.gallery', en.gallery],
    ['api::first-visit.first-visit', en.first_visit],
  ];
  for (const [uid, data] of SINGLES) {
    if (!data) continue;
    const ro = await getRoSingle(strapi, uid);
    log.push(`${uid}: ${await addLocalization(strapi, uid, ro, data)}`);
  }

  const COLLECTIONS = [
    ['api::program.program', en.programs],
    ['api::history.history', en.histories],
    ['api::event.event', en.events],
  ];
  for (const [uid, items] of COLLECTIONS) {
    if (!Array.isArray(items) || !items.length) continue;
    const roRows = await getRoCollection(strapi, uid);
    for (const item of items) {
      const ro = roRows.find((r) => r.id === item.id);
      const { id, ...data } = item;
      log.push(`${uid}#${item.id}: ${await addLocalization(strapi, uid, ro, data)}`);
    }
  }

  strapi.log.info('seedEnglish:\n  ' + log.join('\n  '));
};
