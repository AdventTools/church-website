'use strict';

// Seed pagina „Ce credem" (RO + EN legate). Idempotent. Conținut inspirat din adventist.ro.

const RO = {
  title: 'Ce credem',
  intro:
    'Suntem creștini adventiști de ziua a șaptea — o comunitate care își întemeiază viața și nădejdea pe Biblie. Iată, pe scurt, ce credem și ce ne definește.',
  content: [
    '## Sfânta Scriptură',
    'Credem că Biblia — Vechiul și Noul Testament — este Cuvântul inspirat al lui Dumnezeu și singura noastră normă de credință și de viață. În ea Îl descoperim pe Dumnezeu și găsim călăuzire pentru fiecare zi.',
    '',
    '## Dumnezeu',
    'Credem într-un singur Dumnezeu, veșnic, în trei Persoane: Tatăl, Fiul și Duhul Sfânt — Creatorul și Susținătorul întregului univers.',
    '',
    '## Isus Hristos și mântuirea',
    'Isus Hristos, Fiul lui Dumnezeu, S-a întrupat, a murit și a înviat pentru noi. Prin credința în jertfa Lui primim iertarea, viața nouă și mântuirea — un dar al harului, nu o răsplată a faptelor.',
    '',
    '## Sabatul',
    'Ținem ziua a șaptea — sâmbăta — ca zi de odihnă și de închinare, așa cum a rânduit-o Dumnezeu încă de la creație. Este un dar de timp, o pauză în care ne reîntâlnim cu El și unii cu alții.',
    '',
    '## A doua venire a lui Isus',
    'Nădejdea noastră este revenirea reală și văzută a lui Isus Hristos. De aici și numele comunității noastre — „Speranța" — pentru că trăim cu bucuria acestei revederi.',
    '',
    '## Botezul',
    'Botezul prin scufundare este mărturisirea publică a credinței în Hristos și angajamentul de a trăi o viață nouă, alături de El.',
    '',
    '## Biserica și comunitatea',
    'Biserica este familia celor care Îl urmează pe Isus. Suntem chemați să fim uniți, să vestim Evanghelia și să slujim cu dragoste oamenilor din jur.',
    '',
    '## Un stil de viață sănătos',
    'Credem că trupul este un dar de la Dumnezeu, așa că prețuim sănătatea întregii ființe — fizic, mintal și spiritual — și încurajăm obiceiuri care aduc viață.',
    '',
    '## Speranța vieții veșnice',
    'Așteptăm un Pământ Nou, fără suferință și fără moarte, unde Dumnezeu va locui cu cei răscumpărați. Aceasta este speranța care ne dă putere astăzi.',
    '',
    '---',
    'Vrei să afli mai multe? Ești binevenit să ne întrebi — sau descoperă prezentarea completă a convingerilor adventiste pe [adventist.ro](https://adventist.ro/convingeri/convingeri-fundamentale/).',
  ].join('\n'),
};

const EN = {
  title: 'What we believe',
  intro:
    'We are Seventh-day Adventist Christians — a community that grounds its life and its hope in the Bible. Here, in short, is what we believe and what defines us.',
  content: [
    '## The Holy Scriptures',
    'We believe that the Bible — the Old and New Testaments — is the inspired Word of God and our only rule of faith and life. In it we discover God and find guidance for every day.',
    '',
    '## God',
    'We believe in one eternal God in three Persons: the Father, the Son, and the Holy Spirit — the Creator and Sustainer of the whole universe.',
    '',
    '## Jesus Christ and salvation',
    'Jesus Christ, the Son of God, became flesh, died, and rose again for us. Through faith in His sacrifice we receive forgiveness, new life, and salvation — a gift of grace, not a reward for works.',
    '',
    '## The Sabbath',
    'We keep the seventh day — Saturday — as a day of rest and worship, just as God established it at creation. It is a gift of time, a pause in which we meet again with Him and with one another.',
    '',
    '## The second coming of Jesus',
    'Our hope is the real and visible return of Jesus Christ. This is where our community\'s name comes from — „Speranța" (Hope) — because we live in the joy of that reunion.',
    '',
    '## Baptism',
    'Baptism by immersion is the public confession of faith in Christ and the commitment to live a new life with Him.',
    '',
    '## The church and community',
    'The church is the family of those who follow Jesus. We are called to be united, to share the Gospel, and to serve the people around us with love.',
    '',
    '## A healthy way of life',
    'We believe the body is a gift from God, so we value the health of the whole person — physical, mental, and spiritual — and encourage habits that bring life.',
    '',
    '## The hope of eternal life',
    'We look forward to a New Earth, without suffering and without death, where God will dwell with the redeemed. This is the hope that gives us strength today.',
    '',
    '---',
    'Would you like to know more? You are welcome to ask us — or explore the full presentation of Adventist beliefs at [adventist.ro](https://adventist.ro/convingeri/convingeri-fundamentale/).',
  ].join('\n'),
};

module.exports = async function seedBeliefs(strapi) {
  const uid = 'api::beliefs.beliefs';
  const locSvc = strapi.plugin('i18n').service('localizations');
  const model = strapi.getModel(uid);

  const roExisting = await strapi.db.query(uid).findOne({ where: { locale: 'ro' } });
  if (roExisting) return;

  const ro = await strapi.entityService.create(uid, { data: { ...RO, locale: 'ro', publishedAt: new Date() } });
  const en = await strapi.entityService.create(uid, {
    data: { ...EN, locale: 'en', publishedAt: new Date(), localizations: [ro.id] },
    populate: ['localizations'],
  });
  await locSvc.syncLocalizations(en, { model });
  strapi.log.info(`Seed: pagina „Ce credem" creată (ro #${ro.id}, en #${en.id}).`);
};
