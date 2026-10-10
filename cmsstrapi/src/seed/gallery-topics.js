'use strict';

// Teme de pornire pentru Galerie (RO + EN), fără nicio poză: biserica le redenumește, le
// reordonează sau le șterge din „Temă galerie”. Idempotent: doar dacă nu există nicio temă.

const TOPICS = [
  { name: 'Servicii divine', nameEn: 'Worship services', order: 10 },
  { name: 'Botezuri', nameEn: 'Baptisms', order: 20 },
  { name: 'Concerte', nameEn: 'Concerts', order: 30 },
  { name: 'Tineret', nameEn: 'Youth', order: 40 },
  { name: 'Tabere și excursii', nameEn: 'Camps and trips', order: 50 },
];

module.exports = async function seedGalleryTopics(strapi) {
  const uid = 'api::gallery-topic.gallery-topic';
  if ((await strapi.db.query(uid).count()) > 0) return;
  for (const data of TOPICS) await strapi.documents(uid).create({ data });
  strapi.log.info(`Seed: ${TOPICS.length} teme de galerie create.`);
};
