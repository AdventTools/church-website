'use strict';

const fs = require('fs');
const path = require('path');

// Șabloane complete de evenimente (RO + EN legate, cu imagine implicită + texte). Editabile de editori.
// Populare o singură dată (rezistent la redenumiri). Câmpurile goale din șablon nu se aplică la eveniment.

const TEMPLATES = [
  {
    image: 'sfanta-cina.png',
    ro: {
      name: 'Sfânta Cină',
      title: 'Serviciu divin cu Sfânta Cină',
      intro: 'Serviciul Sfintei Cine — ne amintim împreună de jertfa Domnului Isus și ne pregătim inimile pentru părtășie cu El.',
      content:
        'Ne adunăm pentru Serviciul Sfintei Cine, un moment de reînnoire spirituală și de bucurie. Începem cu rânduiala spălării picioarelor — un simbol al smereniei și al iertării reciproce — apoi împărtășim pâinea și rodul viței, amintindu-ne de trupul și sângele Domnului Isus, dați pentru noi. Este un serviciu deschis tuturor celor care Îl iubesc pe Domnul. Te așteptăm cu drag.',
    },
    en: {
      name: 'The Lord’s Supper',
      title: 'Communion Service',
      intro: 'The Communion Service — together we remember the sacrifice of the Lord Jesus and prepare our hearts for fellowship with Him.',
      content:
        'We gather for the Communion Service, a time of spiritual renewal and joy. We begin with the ordinance of foot-washing — a symbol of humility and mutual forgiveness — then we share the bread and the fruit of the vine, remembering the body and blood of the Lord Jesus, given for us. This service is open to all who love the Lord. We warmly welcome you.',
    },
  },
  {
    image: 'invitat.png',
    ro: {
      name: 'Invitat',
      title: 'Invitat special',
      intro: 'Un invitat special ne aduce un mesaj din Cuvântul lui Dumnezeu.',
      content:
        'Avem bucuria de a avea alături de noi un invitat special. Completează numele invitatului și tema mesajului pentru acest eveniment. Este o ocazie deosebită de a fi împreună, de a asculta și de a crește în credință. Te așteptăm cu drag!',
    },
    en: {
      name: 'Guest speaker',
      title: 'Special guest',
      intro: 'A special guest brings us a message from the Word of God.',
      content:
        'We are glad to welcome a special guest. Add the guest’s name and the theme of the message for this event. It is a wonderful occasion to be together, to listen, and to grow in faith. We warmly welcome you!',
    },
  },
  {
    image: 'botez.png',
    ro: {
      name: 'Botez',
      title: 'Serviciu de botez',
      intro: 'Serviciu de botez — o zi de sărbătoare, când cineva își mărturisește public credința în Domnul Isus.',
      content:
        'Ne bucurăm împreună cu cei care aleg să Îl urmeze pe Domnul Isus prin botez. Botezul prin scufundare este mărturisirea publică a credinței și începutul unei vieți noi alături de El. Vino să fii părtaș la această zi de bucurie și să te rogi pentru cei care fac acest pas important. Slavă lui Dumnezeu!',
    },
    en: {
      name: 'Baptism',
      title: 'Baptism service',
      intro: 'A baptism service — a day of celebration when someone publicly confesses their faith in the Lord Jesus.',
      content:
        'We rejoice together with those who choose to follow the Lord Jesus through baptism. Baptism by immersion is the public confession of faith and the beginning of a new life with Him. Come and share in this day of joy, and pray for those taking this important step. Praise God!',
    },
  },
  {
    image: 'amicus.png',
    ro: {
      name: 'AMiCUS',
      title: 'Eveniment AMiCUS',
      intro: 'Un eveniment organizat de AMiCUS, grupul studenților adventiști, la biserica noastră.',
      content:
        'Studenții AMiCUS organizează un eveniment în biserica noastră. Programul diferă de la o ediție la alta: invitați speciali, prezentarea bobocilor la început de an universitar, festivitatea absolvenților sau seri tematice. Completează tema și detaliile acestei ediții. Ești binevenit să te bucuri împreună cu ei!',
    },
    en: {
      name: 'AMiCUS',
      title: 'AMiCUS event',
      intro: 'An event organized by AMiCUS, the Adventist students’ group, at our church.',
      content:
        'The AMiCUS students organize an event at our church. The program differs from one edition to another: special guests, the welcome of first-year students, the graduates’ celebration, or themed evenings. Add the theme and details of this edition. You are welcome to celebrate with them!',
    },
  },
];

async function uploadCover(strapi, filename) {
  try {
    const fp = path.join(__dirname, 'assets', filename);
    if (!fs.existsSync(fp)) return null;
    const size = fs.statSync(fp).size;
    const [file] = await strapi.plugin('upload').service('upload').upload({
      data: {},
      files: { filepath: fp, path: fp, originalFileName: filename, name: filename, mimetype: 'image/png', type: 'image/png', size },
    });
    return file && file.id ? file.id : null;
  } catch (e) {
    strapi.log.warn(`upload șablon ${filename}: ${e.message}`);
    return null;
  }
}

module.exports = async function seedEventTemplates(strapi) {
  const uid = 'api::event-template.event-template';
  if ((await strapi.db.query(uid).count()) > 0) return;
  const locSvc = strapi.plugin('i18n').service('localizations');
  const model = strapi.getModel(uid);

  for (const { ro, en, image } of TEMPLATES) {
    const coverId = await uploadCover(strapi, image);
    const roEntry = await strapi.entityService.create(uid, { data: { ...ro, ...(coverId ? { cover: coverId } : {}), locale: 'ro' } });
    const enEntry = await strapi.entityService.create(uid, {
      data: { ...en, ...(coverId ? { cover: coverId } : {}), locale: 'en', localizations: [roEntry.id] },
      populate: ['localizations'],
    });
    await locSvc.syncLocalizations(enEntry, { model });
    strapi.log.info(`Seed: șablon eveniment „${ro.name}” creat.`);
  }
};
