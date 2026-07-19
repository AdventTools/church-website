'use strict';

// CMS-ul nu se indexează niciodată de motoarele de căutare.
module.exports = () => async (ctx, next) => {
  ctx.set('X-Robots-Tag', 'noindex, nofollow');
  await next();
};
