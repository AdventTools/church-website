'use strict';

const jwt = require('jsonwebtoken');

// Rutele noastre trăiesc pe `content-api` — Strapi le forțează acolo pe cele din `src/api/`, deci
// nu pot cere autentificarea de panou prin configurare. O validăm noi, pe tokenul emis de panou.
// Din 5.51 încoace el poartă `userId` + `sessionId`, nu `id`; cine presupune altfel primește un 500.
// Semnătura validă nu ajunge: tokenul poate aparține unui cont șters, dezactivat sau blocat.
async function adminFromToken(strapi, ctx) {
  const header = ctx.request.header.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, strapi.config.get('admin.auth.secret'));
    if (payload.type && payload.type !== 'access') return null;
    const id = Number(payload.userId ?? payload.id);
    if (!id) return null;
    const user = await strapi.db.query('admin::user').findOne({ where: { id }, populate: ['roles'] });
    return user && user.isActive && !user.blocked ? user : null;
  } catch {
    return null;
  }
}

const isSuperAdmin = (user) => !!(user && (user.roles || []).some((r) => r.code === 'strapi-super-admin'));

// Conturile de colegi le gestionează doar Super Admin — editorii n-au ce căuta acolo.
async function superAdminFromToken(strapi, ctx) {
  const user = await adminFromToken(strapi, ctx);
  return isSuperAdmin(user) ? user : null;
}

module.exports = { adminFromToken, superAdminFromToken, isSuperAdmin };
