'use strict';

// Seed „Ce ne definește" (valorile) pe home-page RO + EN. Idempotent: doar dacă lipsesc.

const RO = [
  { icon: 'bible', title: 'Biblia, temelia noastră', text: 'Credem că Scriptura este Cuvântul lui Dumnezeu și busola pentru viața de zi cu zi.' },
  { icon: 'community', title: 'O familie primitoare', text: 'Suntem o comunitate caldă, în care fiecare om contează și este binevenit așa cum este.' },
  { icon: 'hope', title: 'Speranța revenirii', text: 'Trăim cu bucurie așteptarea revenirii lui Isus — de aici și numele nostru, „Speranța".' },
  { icon: 'health', title: 'Grijă pentru trup și suflet', text: 'Prețuim sănătatea întregii ființe — fizic, mintal și spiritual — ca dar de la Dumnezeu.' },
];

const EN = [
  { icon: 'bible', title: 'The Bible, our foundation', text: 'We believe Scripture is the Word of God and the compass for everyday life.' },
  { icon: 'community', title: 'A welcoming family', text: 'We are a warm community where every person matters and is welcome, just as they are.' },
  { icon: 'hope', title: 'The hope of His return', text: 'We joyfully await the return of Jesus — hence our name, „Speranța" (Hope).' },
  { icon: 'health', title: 'Care for body and soul', text: 'We value the health of the whole person — physical, mental, and spiritual — as a gift from God.' },
];

module.exports = async function seedHomeValues(strapi) {
  const uid = 'api::home-page.home-page';
  for (const [locale, values] of [['ro', RO], ['en', EN]]) {
    const row = await strapi.db.query(uid).findOne({ where: { locale }, populate: ['values'] });
    if (!row || (row.values && row.values.length > 0)) continue;
    await strapi.entityService.update(uid, row.id, { data: { values } });
    strapi.log.info(`Seed: valori home-page „${locale}" adăugate.`);
  }
};
