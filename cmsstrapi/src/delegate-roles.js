'use strict';

// Roluri delegabile:
//  - „Colaborator evenimente": vede TOATE evenimentele, adaugă evenimente, editează/șterge DOAR ale lui.
//  - „Responsabil <Proiect>" (unul per proiect): editează DOAR acel proiect + drepturile de mai sus pe evenimente.
// Enforcarea „doar acel proiect" se face cu o condiție custom înregistrată per proiect.

const CM = (a) => `plugin::content-manager.explorer.${a}`;

// Câmpurile editabile ale unui content-type (scalar/media + subcâmpuri de componente), pentru permisiuni.
function fieldsFor(strapi, uid) {
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
}

// Permisiuni pe media (ca să poată atașa poze/coperți).
const UPLOAD = [
  { action: 'plugin::upload.read', conditions: [] },
  { action: 'plugin::upload.assets.create', conditions: [] },
  { action: 'plugin::upload.assets.download', conditions: [] },
  { action: 'plugin::upload.configure-view', conditions: [] },
];

function eventPerms(fields, canDelete = true) {
  const p = [
    { action: CM('read'), subject: 'api::event.event', properties: { fields }, conditions: [] }, // vede toate
    { action: CM('create'), subject: 'api::event.event', properties: { fields }, conditions: [] },
    { action: CM('update'), subject: 'api::event.event', properties: { fields }, conditions: ['admin::is-creator'] }, // doar ale lui
  ];
  if (canDelete) p.push({ action: CM('delete'), subject: 'api::event.event', properties: {}, conditions: ['admin::is-creator'] });
  return p;
}

async function ensureRole(strapi, code, name, description, permissions) {
  let role = await strapi.db.query('admin::role').findOne({ where: { code } });
  if (!role) {
    role = await strapi.service('admin::role').create({ name, code, description });
    strapi.log.info(`Rol creat: ${name}`);
  }
  await strapi.service('admin::role').assignPermissions(role.id, permissions);
  return role;
}

module.exports = async function configureDelegateRoles(strapi) {
  try {
    const eventFields = fieldsFor(strapi, 'api::event.event');
    const projectFields = fieldsFor(strapi, 'api::project.project');
    // Ca să funcționeze dropdown-ul „Aplică un șablon", rolul trebuie să poată CITI șabloanele.
    const templateFields = strapi.contentType('api::event-template.event-template')
      ? fieldsFor(strapi, 'api::event-template.event-template')
      : [];
    const templateRead = { action: CM('read'), subject: 'api::event-template.event-template', properties: { fields: templateFields }, conditions: [] };

    // 1) Colaborator evenimente
    await ensureRole(
      strapi,
      'colaborator-evenimente',
      'Colaborator evenimente',
      'Vede toate evenimentele, adaugă evenimente și editează/șterge doar propriile evenimente.',
      [...eventPerms(eventFields), templateRead, ...UPLOAD],
    );

    // 2) Responsabil <Proiect> — câte unul per proiect, cu condiție per-proiect.
    const cp =
      strapi.admin && strapi.admin.services && strapi.admin.services.permission && strapi.admin.services.permission.conditionProvider;
    const projects = await strapi.db.query('api::project.project').findMany({ where: { locale: 'ro' } });

    // Întâi înregistrăm condițiile (register e ASINCRON — trebuie awaitat înainte de a le folosi).
    if (cp) {
      for (const p of projects) {
        if (!p.slug) continue;
        const condId = `admin::project-only-${p.slug}`;
        if (!cp.has(condId)) {
          const slug = p.slug;
          try {
            await cp.register({
              displayName: `Doar proiectul: ${p.title}`,
              name: `project-only-${p.slug}`,
              plugin: 'admin',
              handler: () => ({ slug }),
            });
          } catch (e) {
            strapi.log.warn(`condiție project-only-${p.slug}: ${e.message}`);
          }
        }
      }
    }

    // Apoi creăm rolurile, cu condiția atașată la editarea proiectului.
    for (const p of projects) {
      if (!p.slug) continue;
      const condId = `admin::project-only-${p.slug}`;
      const projectUpdateCond = cp && cp.has(condId) ? [condId] : [];
      await ensureRole(
        strapi,
        `responsabil-${p.slug}`,
        `Responsabil: ${p.title}`,
        `Editează doar proiectul „${p.title}” și poate adăuga/edita propriile evenimente.`,
        [
          { action: CM('read'), subject: 'api::project.project', properties: { fields: projectFields }, conditions: [] },
          { action: CM('update'), subject: 'api::project.project', properties: { fields: projectFields }, conditions: projectUpdateCond },
          ...eventPerms(eventFields),
          templateRead,
          ...UPLOAD,
        ],
      );
    }
  } catch (err) {
    strapi.log.error(`configureDelegateRoles: ${err.message}`);
  }
};
