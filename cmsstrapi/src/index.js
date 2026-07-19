'use strict';

// Acțiuni de citire publică per content-type (single types: doar `find`; collection: `find` + `findOne`).
const PUBLIC_READ = {
  'church-info': ['find'],
  'home-page': ['find'],
  contact: ['find'],
  style: ['find'],
  background: ['find'],
  'under-construction': ['find'],
  gallery: ['find'],
  'first-visit': ['find'],
  beliefs: ['find'],
  event: ['find', 'findOne'],
  history: ['find', 'findOne'],
  program: ['find', 'findOne'],
  project: ['find', 'findOne'],
  article: ['find', 'findOne'],
};

async function grantPublicRead(strapi) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  for (const [api, actions] of Object.entries(PUBLIC_READ)) {
    for (const action of actions) {
      const perm = `api::${api}.${api}.${action}`;
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: perm, role: publicRole.id } });
      if (!existing) {
        await strapi
          .query('plugin::users-permissions.permission')
          .create({ data: { action: perm, role: publicRole.id } });
      }
    }
  }
}

// Conținut inițial pentru „Prima ta vizită” — creat o singură dată, apoi editabil integral din CMS.
async function seedFirstVisit(strapi) {
  const existing = await strapi.db.query('api::first-visit.first-visit').findOne({});
  if (existing) return;

  await strapi.entityService.create('api::first-visit.first-visit', {
    data: {
      title: 'Prima ta vizită',
      subtitle: 'Tot ce trebuie să știi înainte să treci pragul — pe scurt și prietenos.',
      intro:
        'Ne bucurăm că te gândești să ne vizitezi! Nu trebuie să te pregătești în vreun fel anume și nu trebuie să cunoști pe nimeni dinainte. ' +
        'Vino așa cum ești — te vom întâmpina cu căldură. Mai jos găsești răspuns la întrebările pe care și le pun majoritatea celor care vin prima dată.',
      highlights: [
        {
          icon: 'clock',
          title: 'Când ne întâlnim',
          text: 'Sabatul (sâmbăta): Școala de Sabat de la ora 10:00 și Serviciul Divin (mesajul principal) de la 11:30. Poți veni la oricare dintre ele sau la amândouă.',
        },
        {
          icon: 'parking',
          title: 'Cum ajungi și unde parchezi',
          text: 'Suntem pe Strada Moților 47. Nu avem parcare proprie — cea mai apropiată este parcarea Primăriei de pe Moților nr. 1. Cel mai simplu vii cu transportul în comun: stația „Spitalul de Copii” este la mai puțin de un minut de biserică.',
        },
        {
          icon: 'kids',
          title: 'Vii cu copii',
          text: 'Minunat! Între orele 10:00 și 11:00 copiii au propria Școală de Sabat, pe grupe de vârstă, cu lecții pe înțelesul lor.',
        },
        {
          icon: 'dress',
          title: 'Cum te îmbraci',
          text: 'Comod și îngrijit. Nu avem un cod vestimentar strict — vino îmbrăcat așa cum te simți bine.',
        },
        {
          icon: 'language',
          title: 'Vorbești altă limbă?',
          text: 'Avem Școală de Sabat și în limba engleză, iar dacă ai nevoie de traducere te putem ajuta cu drag. Predicile principale sunt în română.',
        },
        {
          icon: 'welcome',
          title: 'La ce să te aștepți',
          text: 'Cântări, rugăciune, un mesaj din Biblie și oameni calzi. Nu trebuie să faci nimic special — doar să fii prezent.',
        },
      ],
      faqs: [
        {
          question: 'La ce oră încep serviciile de sâmbătă?',
          answer:
            'Școala de Sabat începe în jurul orei 10:00, iar Serviciul Divin (mesajul principal) de la 11:30. Poți veni la oricare dintre ele.',
        },
        {
          question: 'Unde parchez mașina?',
          answer:
            'Nu avem parcare proprie. Cea mai apropiată este parcarea Primăriei de pe strada Moților nr. 1. Alternativ, stația de transport în comun „Spitalul de Copii” este la sub un minut de mers pe jos de biserică.',
        },
        {
          question: 'Cum trebuie să mă îmbrac?',
          answer: 'Comod și îngrijit. Nu există un cod vestimentar strict; te așteptăm exact așa cum ești.',
        },
        {
          question: 'Pot veni cu copiii?',
          answer:
            'Da, cu drag. Între orele 10:00 și 11:00 copiii au propria Școală de Sabat, organizată pe grupe de vârstă.',
        },
        {
          question: 'Trebuie să fiu adventist ca să particip?',
          answer:
            'Nu. Ușile sunt deschise oricui, indiferent de confesiune sau de experiența cu biserica. Ești binevenit ca oaspete.',
        },
        {
          question: 'Serviciile se țin și în engleză?',
          answer:
            'Avem Școală de Sabat în limba engleză, iar la nevoie putem oferi traducere personală. Predicile principale sunt susținute în română.',
        },
        {
          question: 'Cât durează serviciul divin?',
          answer: 'Serviciul Divin durează în general aproximativ o oră și jumătate.',
        },
      ],
      closingTitle: 'Ne bucurăm să te cunoaștem',
      closingText:
        'Dacă mai ai orice întrebare înainte de prima vizită, scrie-ne — îți răspundem cu drag. Te așteptăm!',
      publishedAt: new Date(),
    },
  });
  strapi.log.info('Seed: „Prima ta vizită” creat.');
}

// Româna trebuie să fie locale-ul DEFAULT înainte de a activa i18n pe content-types,
// altfel conținutul RO existent ar fi etichetat greșit ca „en”. Engleza rămâne locale secundar (/en).
async function ensureRomanianDefault(strapi) {
  const locales = strapi.plugin('i18n').service('locales');
  const ro = await locales.findByCode('ro');
  if (!ro) {
    await locales.create({ name: 'Română (ro)', code: 'ro' });
    strapi.log.info('i18n: locale „ro” creat.');
  }
  const current = await locales.getDefaultLocale();
  if (current !== 'ro') {
    await locales.setDefaultLocale({ code: 'ro' });
    strapi.log.info(`i18n: locale default schimbat din „${current}” în „ro”.`);
  }
}

// Editor + Author pot gestiona TOT conținutul, mai puțin contul SMTP (rămâne doar la Super Admin).
// Editor: creare/citire/editare/ștergere/publicare pe toate content-type-urile; fără acces la Setări.
// Author: la fel, DAR doar pe conținutul propriu (is-creator) și fără publicare.
// Rulează la fiecare boot: adaugă doar ce lipsește (idempotent) — acoperă și tipurile viitoare.
async function configureContentRoles(strapi) {
  try {
    const permSvc = strapi.service('admin::permission');
    const roleSvc = strapi.service('admin::role');
    if (!permSvc || !roleSvc || typeof roleSvc.assignPermissions !== 'function') return;

    const uids = Object.keys(strapi.contentTypes).filter((uid) => uid.startsWith('api::') && uid !== 'api::smtp.smtp');

    const fieldsFor = (uid) => {
      const out = [];
      const walk = (attributes, prefix) => {
        for (const [name, attr] of Object.entries(attributes || {})) {
          if (!attr || attr.type === 'relation') continue;
          if (attr.type === 'component') {
            const comp = strapi.components[attr.component];
            if (comp) walk(comp.attributes, `${prefix}${name}.`);
          } else if (attr.type !== 'dynamiczone') {
            out.push(`${prefix}${name}`);
          }
        }
      };
      walk(strapi.contentType(uid).attributes, '');
      return out;
    };

    const CM = (a) => `plugin::content-manager.explorer.${a}`;
    const desiredFor = (conditions, withPublish) => {
      const perms = [];
      for (const uid of uids) {
        const ct = strapi.contentType(uid);
        const fields = fieldsFor(uid);
        perms.push({ action: CM('create'), subject: uid, properties: { fields }, conditions });
        perms.push({ action: CM('read'), subject: uid, properties: { fields }, conditions });
        perms.push({ action: CM('update'), subject: uid, properties: { fields }, conditions });
        if (ct.kind === 'collectionType') perms.push({ action: CM('delete'), subject: uid, properties: {}, conditions });
        if (ct.options && ct.options.draftAndPublish && withPublish) {
          perms.push({ action: CM('publish'), subject: uid, properties: {}, conditions });
        }
      }
      return perms;
    };

    const roles = [
      { code: 'strapi-editor', conditions: [], withPublish: true },
      { code: 'strapi-author', conditions: ['admin::is-creator'], withPublish: false },
    ];

    for (const { code, conditions, withPublish } of roles) {
      const role = await strapi.db.query('admin::role').findOne({ where: { code } });
      if (!role) continue;
      const existing = await permSvc.findMany({ where: { role: { id: role.id } } });
      const key = (p) => `${p.action}|${p.subject}`;
      const seen = new Set(existing.map(key));
      const merged = existing.map((p) => ({
        action: p.action,
        subject: p.subject,
        properties: p.properties || {},
        conditions: p.conditions || [],
        actionParameters: p.actionParameters || {},
      }));
      let added = 0;
      for (const d of desiredFor(conditions, withPublish)) {
        if (!seen.has(key(d))) {
          merged.push(d);
          seen.add(key(d));
          added += 1;
        }
      }
      if (added > 0) {
        await roleSvc.assignPermissions(role.id, merged);
        strapi.log.info(`Roles: ${code} +${added} permisiuni de conținut (toate content-type-urile, mai puțin SMTP).`);
      }
    }
  } catch (err) {
    strapi.log.error(`configureContentRoles: ${err.message}`);
  }
}

// Site fără conturi de utilizatori publici → dezactivăm înregistrarea publică (suprafață inutilă).
// Astfel, fluxurile de e-mail din users-permissions (confirmare/resetare parolă) rămân complet inerte.
async function hardenUsersPermissions(strapi) {
  try {
    const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const advanced = await store.get({ key: 'advanced' });
    if (advanced && advanced.allow_register) {
      await store.set({ key: 'advanced', value: { ...advanced, allow_register: false } });
      strapi.log.info('Users-permissions: înregistrarea publică dezactivată (nefolosită pe acest site).');
    }
  } catch (err) {
    strapi.log.error(`hardenUsersPermissions: ${err.message}`);
  }
}

const seedEnglish = require('./seed/english');
const configureAdminViews = require('./admin-views');
const configureDelegateRoles = require('./delegate-roles');
const seedProjects = require('./seed/projects');
const seedArticles = require('./seed/articles');
const seedEventTemplates = require('./seed/event-templates');
const seedHomeValues = require('./seed/home-values');
const seedBeliefs = require('./seed/beliefs');

module.exports = {
  register() {},
  async bootstrap({ strapi }) {
    await ensureRomanianDefault(strapi);
    await grantPublicRead(strapi);
    await configureContentRoles(strapi);
    await hardenUsersPermissions(strapi);
    await configureAdminViews(strapi);
    await seedFirstVisit(strapi);
    await seedEnglish(strapi);
    await seedProjects(strapi);
    await seedArticles(strapi);
    await seedEventTemplates(strapi);
    await seedHomeValues(strapi);
    await seedBeliefs(strapi);
    await configureDelegateRoles(strapi);
  },
};
