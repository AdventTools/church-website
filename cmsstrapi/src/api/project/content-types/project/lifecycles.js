'use strict';

// Slug curat pentru linkuri, generat AUTOMAT din titlu la CREARE (dacă e gol).
// La editare NU se regenerează din titlu (redenumirea titlului nu schimbă URL-ul).
// Dacă slug-ul CHIAR se schimbă, vechiul slug se păstrează în `oldSlugs` → redirect 301
// de pe linkurile vechi (nu pierdem nimic în Google / linkuri partajate).
const slugify = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

module.exports = {
  beforeCreate(event) {
    const d = event.params.data;
    if (!d) return;
    if (d.slug && String(d.slug).trim()) d.slug = slugify(d.slug);
    else if (d.title) d.slug = slugify(d.title);
  },
  async beforeUpdate(event) {
    const d = event.params.data;
    if (!d || !d.slug || !String(d.slug).trim()) return;
    const newSlug = slugify(d.slug);
    d.slug = newSlug;
    try {
      const cur = await strapi.db.query(event.model.uid).findOne({ where: event.params.where });
      if (cur && cur.slug && cur.slug !== newSlug) {
        const olds = new Set((cur.oldSlugs || '').split(',').map((s) => s.trim()).filter(Boolean));
        olds.add(cur.slug);
        olds.delete(newSlug);
        d.oldSlugs = Array.from(olds).join(',');
      }
    } catch (e) {
      strapi.log.warn(`slug oldSlugs: ${e.message}`);
    }
  },
};
