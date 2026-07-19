'use strict';

// Rădăcina CMS (`/`) duce direct la panoul de administrare, nu la pagina implicită Strapi.
module.exports = () => async (ctx, next) => {
  if (ctx.path === '/') {
    ctx.redirect('/admin');
    return;
  }
  await next();
};
