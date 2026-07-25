'use strict';

// Seed inițial proiecte (RO + EN legate). Idempotent per-proiect (după titlul RO).
// Încadrate pentru Cluj. Conținut provizoriu — se poate repopula din CMS.

const yt = (id) => ({ url: `https://www.youtube.com/watch?v=${id}` });
// Videourile aparțin fiecărei formații (nu global).
const CHOIR_VIDEOS = ['uguBcSg-bwI', 'EChKQ534MIo', 'HgC8nBdsbYI', 'K5r-J0-ySDA', 'tKrMggKK4Fc', 'rXwjIbrPm_A', 'YrL5hpap_Jk'].map(yt);
const ECHO_VIDEOS = ['2iVk3uKFXuY', 'ASE3PUxi6Io', 'Q-F3CFGpwXE', 'dCsYFmfbmWY', 'P4XC3vhOyjY', '_DFyaVSY6Fk', 'N8SDJv1d-Ps'].map(yt);
const SOLOIST_VIDEOS = ['tTmtNOjqO_w', 'kSIInlm5rbs', 'dP7KTUd0xJo', 'YeCxcBJdFIc'].map(yt);

const CHOIR_CONDUCTORS = [
  'Emi Suciu',
  'Adrian Vinars',
  'Samy Balasa',
  'Iulia Jureschi',
  'Emilia Campian',
  'Soporan Teodor',
  'Cristina Potocean',
  'Cristina Pascu',
  'Irina Rusneac',
  'Laurențiu Bischin',
  'Daniel Pașca',
  'David Modiga',
  'Iustin Moldovan',
  'Viorel Oncea',
].map((name) => ({ name }));

const RO_ENSEMBLES = [
  {
    name: 'Corul bisericii',
    description:
      'Corul face parte din viața comunității „Speranța" încă de la începuturile ei și a cântat, de-a lungul timpului, sub bagheta mai multor dirijori. Prin cântarea corală, ducem mai departe frumusețea închinării spre slava lui Dumnezeu.',
    peopleLabel: 'Dirijori de-a lungul timpului',
    conductors: CHOIR_CONDUCTORS,
    videos: CHOIR_VIDEOS,
  },
  {
    name: 'Grupul vocal Echo',
    description:
      'Coordonat și dirijat de Samy Balasa, grupul vocal Echo cântă împreună din 2017 — de fapt, membrii lui se cunosc și cântă încă din copilărie, cu mici schimbări de-a lungul anilor. Astăzi sunt un grup omogen, cu concerte în țară și peste hotare, care slujesc prin muzică cu bucurie și dăruire.',
    videos: ECHO_VIDEOS,
  },
  {
    name: 'Simion Folfa',
    description:
      'Simion Folfa este un solist profesionist, cu o voce care transmite emoție și credință. Prin cântecele sale ne cheamă să Îl privim pe Dumnezeu și să găsim mângâiere și speranță.',
    videos: SOLOIST_VIDEOS,
  },
];

const EN_ENSEMBLES = [
  {
    name: 'Church Choir',
    description:
      'The choir has been part of the life of the „Speranța" community since its very beginnings and has sung, over the years, under the baton of many conductors. Through choral singing, we carry on the beauty of worship to the glory of God.',
    peopleLabel: 'Conductors over the years',
    conductors: CHOIR_CONDUCTORS,
    videos: CHOIR_VIDEOS,
  },
  {
    name: 'Echo Vocal Group',
    description:
      'Coordinated and conducted by Samy Balasa, the Echo vocal group has been singing together since 2017 — in fact, its members have known and sung with one another since childhood, with small changes over the years. Today they are a close-knit group, with concerts at home and abroad, serving through music with joy and dedication.',
    videos: ECHO_VIDEOS,
  },
  {
    name: 'Simion Folfa',
    description:
      'Simion Folfa is a professional soloist whose voice conveys emotion and faith. Through his songs he invites us to look to God and to find comfort and hope.',
    videos: SOLOIST_VIDEOS,
  },
];

const PROJECTS = [
  {
    slug: 'din-grija-pentru-tine',
    ro: {
      title: 'Din grijă pentru tine',
      summary:
        'Campanie de sănătate și prevenție a comunității adventiste — consultații și investigații medicale gratuite, oferite cu drag clujenilor.',
      content:
        '„Din grijă pentru tine" este un proiect de educație pentru sănătate și prevenție medicală, pornit chiar aici, la Cluj, și desfășurat frecvent în oraș. Medici și voluntari oferă gratuit consultații de specialitate și investigații — de la ecografii și analize de screening până la sfaturi pentru un stil de viață sănătos.\n\nCredem că grija pentru trup și pentru suflet merg împreună, așa că punem la dispoziția clujenilor timp, atenție și expertiză medicală, fără niciun cost. Proiectul se adresează tuturor, cu o atenție aparte față de cei care nu au acces ușor la servicii medicale de calitate.\n\nDacă vrei să afli când are loc următoarea ediție la Cluj sau cum te poți implica în echipa de voluntari, scrie-ne — te așteptăm cu drag.',
      externalUrl: 'https://dingrijapentrutine.ro',
      order: 1,
    },
    en: {
      title: 'Because We Care About You',
      summary:
        'A health and prevention campaign of the Adventist community — free medical consultations and screenings, offered with love to the people of Cluj.',
      content:
        '"Because We Care About You" ("Din grijă pentru tine") is a health-education and medical-prevention project that started right here in Cluj and is held frequently in the city. Doctors and volunteers offer free specialist consultations and investigations — from ultrasounds and screening tests to guidance for a healthy lifestyle.\n\nWe believe that caring for the body and the soul go hand in hand, so we offer the people of Cluj our time, attention, and medical expertise, free of charge. The project is open to everyone, with special care for those who do not have easy access to quality medical services.\n\nIf you would like to know when the next edition takes place in Cluj, or how you can join the team of volunteers, write to us — we would be glad to hear from you.',
      externalUrl: 'https://dingrijapentrutine.ro',
      order: 1,
    },
  },
  {
    slug: 'masa-calda',
    ro: {
      title: 'Masa caldă',
      summary:
        'Periodic, biserica din Cluj oferă o masă caldă celor săraci și aflați în nevoie — un gest simplu de dragoste și demnitate.',
      content:
        'Prin proiectul „Masa caldă", comunitatea noastră din Cluj pregătește și oferă, cu regularitate, o masă caldă oamenilor săraci și aflați în nevoie. Nu urmăm o cadență fixă — mergem acolo unde este nevoie, atunci când este nevoie.\n\nDincolo de mâncare, ne dorim să oferim demnitate, un zâmbet și certitudinea că cineva le poartă de grijă. Credem că iubirea se arată în fapte concrete, iar o masă caldă poate fi începutul unei relații și al speranței.\n\nDacă vrei să contribui — cu timp, cu mâncare sau cu o donație — ori să te alături echipei de voluntari, scrie-ne. Împreună putem face mai mult.',
      order: 2,
    },
    en: {
      title: 'A Warm Meal',
      summary:
        'From time to time, the Cluj church offers a warm meal to the poor and those in need — a simple gesture of love and dignity.',
      content:
        'Through the "A Warm Meal" project, our community in Cluj regularly prepares and offers a warm meal to people who are poor and in need. We do not follow a fixed schedule — we go where there is need, when there is need.\n\nBeyond the food, we want to offer dignity, a smile, and the assurance that someone cares. We believe love shows itself in concrete deeds, and a warm meal can be the beginning of a relationship and of hope.\n\nIf you would like to contribute — with your time, with food, or with a donation — or to join the team of volunteers, write to us. Together we can do more.',
      order: 2,
    },
  },
  {
    slug: 'amicus',
    ro: {
      title: 'AMiCUS',
      summary:
        'Proiectul dedicat studenților — la Cluj foarte activ, cu întâlniri săptămânale. „Hai să fim prieteni!”',
      content:
        'AMiCUS este proiectul dedicat studenților: un spațiu prietenos în care tinerii se dezvoltă împreună, învață, se roagă și slujesc comunitatea. Sloganul „Hai să fim prieteni!” spune tot despre atmosfera pe care o găsești aici.\n\nLa Cluj-Napoca, unul dintre cele mai active centre universitare din țară, AMiCUS se întâlnește săptămânal — miercuri, de la ora 20:00. Întâlnirile îmbină discuții pe teme relevante pentru studenți, dezvoltare personală, prietenie autentică și voluntariat cu impact în cetate.\n\nDacă ești student la Cluj și cauți prieteni buni și un rost dincolo de cursuri, ești binevenit — vino așa cum ești.',
      externalUrl: 'https://amicus.ro',
      order: 3,
    },
    en: {
      title: 'AMiCUS',
      summary:
        'The project dedicated to students — very active in Cluj, with weekly meetings. “Let’s be friends!”',
      content:
        'AMiCUS is the project dedicated to students: a friendly space where young people grow together, learn, pray, and serve the community. The motto "Let\'s be friends!" says it all about the atmosphere you\'ll find here.\n\nIn Cluj-Napoca, one of the most active university centers in the country, AMiCUS meets weekly — on Wednesdays at 8:00 PM. The meetings blend discussions on topics relevant to students, personal development, genuine friendship, and volunteering that makes a difference in the city.\n\nIf you are a student in Cluj looking for good friends and a purpose beyond your classes, you are welcome — come just as you are.',
      externalUrl: 'https://amicus.ro',
      order: 3,
    },
  },
  {
    slug: 'muzica-si-inchinare',
    ro: {
      title: 'Muzică și închinare',
      summary:
        'Muzică bună și înălțătoare — corul bisericii, grupul vocal Echo și soliști — prin care Îl cunoaștem pe Dumnezeu și ne închinăm Lui.',
      content:
        'La „Speranța", muzica nu este doar un moment din program — este o formă de închinare și o punte către inima omului. Corul bisericii, grupul vocal Echo și soliștii noștri împărtășesc, prin cântare, frumusețea Evangheliei și bucuria credinței.\n\nCredem în muzica de calitate, care înalță sufletul și Îl proslăvește pe Dumnezeu. Mai jos poți asculta și privi o parte din ceea ce cântăm — lasă-te purtat de melodii.',
      order: 4,
      ensembles: RO_ENSEMBLES,
    },
    en: {
      title: 'Music & Worship',
      summary:
        'Good, uplifting music — the church choir, the Echo vocal group, and soloists — through which we come to know God and worship Him.',
      content:
        'At „Speranța", music is not merely a moment in the program — it is a form of worship and a bridge to the human heart. Our church choir, the Echo vocal group, and our soloists share, through song, the beauty of the Gospel and the joy of faith.\n\nWe believe in music of quality that lifts the soul and glorifies God. Below you can listen to and watch some of what we sing — let the melodies carry you.',
      order: 4,
      ensembles: EN_ENSEMBLES,
    },
  },
  {
    slug: 'gradinita-crestina',
    ro: {
      title: 'Grădinița creștină Kinderfreude',
      summary:
        'Grădiniță creștină în centrul Cluj-Napoca — atmosferă de familie, educatoare calificate, meniu ovo-lacto-vegetarian, germană și engleză, grupe mici.',
      content:
        'Grădinița Kinderfreude este o grădiniță creștină din inima Cluj-Napoca, unde fiecare copil este înconjurat de căldură, dragoste și grijă. Îl îndrumăm și îl supraveghem permanent prin cadre didactice calificate, capabile să răspundă nevoilor lui educaționale, sociale și emoționale.\n\nDeviza noastră: „Învață pe copil calea pe care trebuie să o urmeze și când va fi mare nu se va abate de la ea."\n\nDe ce Kinderfreude?\n• Atmosferă de familie — respectăm și punem preț pe nevoile fiecărui copil.\n• Avem încredere în copii, le ghidăm învățarea și le stimulăm creativitatea.\n• Educatoare calificate.\n• Educație moral-creștină, atât de necesară formării unui caracter frumos.\n• Grupe cu număr mic de copii.\n• Alimentație sănătoasă, printr-un meniu ovo-lacto-vegetarian.\n• Asistență medicală.\n• Comunicare eficientă cu părinții.\n• Sediu în centrul orașului.\n\nCe învățăm\nÎntr-un cadru prietenos, cei mici participă la activități variate:\n• educație timpurie conform curriculumului național — comunicare, socializare, dezvoltare cognitivă, emoțională și fizică;\n• predare în limba germană și engleză;\n• arte plastice și decorative: desen, pictură, modelaj, colaj;\n• educație creștină — povestiri și texte biblice;\n• ateliere diverse: actorie, educație rutieră, bunele maniere, sănătate, muzică, micii bucătari, experimente trăznite;\n• activități ale părinților împreună cu copiii;\n• concursuri, excursii și vizite, iar opțional înot.\n\nValorile în care credem\nDragostea, prietenia, respectul, bucuria, excelența, responsabilitatea, cinstea, toleranța și ocrotirea mediului.\n\nMisiunea noastră\n• să ne asigurăm că fiecare copil se simte prețuit și își valorifică potențialul;\n• să oferim o grădiniță primitoare și sigură;\n• să dăm fiecăruia șansa să învețe;\n• să încurajăm creativitatea;\n• să ne ascultăm unii pe alții;\n• să transmitem valori morale prețioase;\n• să respectăm mediul înconjurător;\n• să promovăm un stil de viață sănătos.\n\nComunicarea cu părinții este strânsă: caietul educatoarei (informare scrisă săptămânală), e-mail (meniu, program, anunțuri), ședințe, discuții directe și evenimente care îi implică pe părinți — activități deschise și serbări.\n\nÎnscrieri și informații actualizate găsiți pe pagina noastră de Facebook (Grădinița Kinderfreude). Site-ul oficial, gradinita-crestina.ro, va fi din nou disponibil în curând.',
      externalUrl: 'https://www.facebook.com/Kinderfreude',
      order: 5,
    },
    en: {
      title: 'Kinderfreude Christian Kindergarten',
      summary:
        'A Christian kindergarten in central Cluj-Napoca — a family atmosphere, qualified teachers, an ovo-lacto-vegetarian menu, German and English, and small groups.',
      content:
        'Kinderfreude is a Christian kindergarten in the heart of Cluj-Napoca, where every child is surrounded by warmth, love, and care. Each child is guided and continually supervised by qualified teachers able to meet their educational, social, and emotional needs.\n\nOur motto: "Train up a child in the way he should go, and when he is old he will not depart from it."\n\nWhy Kinderfreude?\n• A family atmosphere — we respect and value the needs of every child.\n• We trust children, guide their learning, and nurture their creativity.\n• Qualified teachers.\n• Moral and Christian education, so essential to shaping a beautiful character.\n• Small group sizes.\n• Healthy food, through an ovo-lacto-vegetarian menu.\n• Medical care on site.\n• Effective communication with parents.\n• Located in the city center.\n\nWhat we learn\nIn a friendly setting, the little ones take part in a variety of activities:\n• early education following the national curriculum — communication, socialization, and cognitive, emotional, and physical development;\n• teaching in German and English;\n• fine and decorative arts: drawing, painting, modeling, collage;\n• Christian education — Bible stories and verses;\n• various workshops: acting, road safety, good manners, health, music, little cooks, and wacky experiments;\n• activities for parents together with their children;\n• contests, trips and visits, with swimming as an option.\n\nThe values we believe in\nLove, friendship, respect, joy, excellence, responsibility, honesty, tolerance, and care for the environment.\n\nOur mission\n• to make sure every child feels valued and fulfills their potential;\n• to offer a welcoming and safe kindergarten;\n• to give everyone the chance to learn;\n• to encourage creativity;\n• to listen to one another;\n• to pass on precious moral values;\n• to respect the environment;\n• to promote a healthy lifestyle.\n\nCommunication with parents is close: the teacher\'s notebook (a weekly written update), e-mail (menu, schedule, announcements), meetings, direct conversations, and events that involve parents — open activities and celebrations.\n\nFor enrollment and up-to-date information, visit our Facebook page (Grădinița Kinderfreude). The official website, gradinita-crestina.ro, will be back online soon.',
      externalUrl: 'https://www.facebook.com/Kinderfreude',
      order: 5,
    },
  },
  {
    slug: 'clasa-de-botez',
    ro: {
      title: 'Clasa de botez',
      summary:
        'Studiu biblic pentru cei care vor să-L cunoască mai bine pe Dumnezeu și să se pregătească pentru botez — în fiecare după-amiază de sabat, la Cluj-Napoca.',
      content:
        'Dacă dorești să-L urmezi pe Hristos, dacă vrei ca viața ta să fie schimbată, dacă pentru tine mântuirea are un preț și dacă învățătura creștină reprezintă Adevărul — te așteptăm la Clasa de Studiu Biblic.\n\nClasa de botez este un parcurs de studiu al Bibliei pentru cei care doresc să Îl cunoască mai bine pe Dumnezeu și să se pregătească pentru botez. Împreună descoperim, pas cu pas, adevărurile Scripturii și temelia credinței creștine — într-o atmosferă caldă, deschisă întrebărilor și fără nicio obligație.\n\nCând ne întâlnim\nÎn fiecare după-amiază de sabat (sâmbătă), cu o oră înainte de începerea serviciului public de închinare.\n\nPentru cine\nPentru oricine, indiferent de experiența cu biserica. Nu trebuie să știi nimic dinainte — vino cu întrebările tale și cu dorința de a căuta.\n\nCoordonator: Beniamin Pascu — 0733 676 175.\n\nDacă vrei să afli mai multe sau să te alături grupei, sună-l pe coordonator ori scrie-ne. Te așteptăm cu drag.',
      order: 6,
    },
    en: {
      title: 'Baptismal Class',
      summary:
        'A Bible study for those who want to know God better and prepare for baptism — every Sabbath afternoon in Cluj-Napoca.',
      content:
        'If you want to follow Christ, if you long for your life to be changed, if salvation means something to you, and if Christian teaching is the Truth — we welcome you to the Bible Study Class.\n\nThe Baptismal Class is a journey through the Bible for those who wish to know God better and prepare for baptism. Together we discover, step by step, the truths of Scripture and the foundation of the Christian faith — in a warm atmosphere, open to questions and with no obligation whatsoever.\n\nWhen we meet\nEvery Sabbath (Saturday) afternoon, one hour before the public worship service begins.\n\nFor whom\nFor anyone, whatever your experience with church. You don\'t need to know anything beforehand — just come with your questions and a desire to seek.\n\nCoordinator: Beniamin Pascu — 0733 676 175.\n\nIf you would like to learn more or join the class, call the coordinator or write to us. We would be glad to welcome you.',
      order: 6,
    },
  },
];

module.exports = async function seedProjects(strapi) {
  const uid = 'api::project.project';
  // Populăm o singură dată. Dacă există DEJA proiecte, nu recreăm (altfel redenumirea unui
  // proiect ar duce la duplicat, pentru că nu s-ar mai potrivi după titlu).
  if ((await strapi.db.query(uid).count()) > 0) return;
  const locSvc = strapi.plugin('i18n').service('localizations');
  const model = strapi.getModel(uid);

  for (const { ro, en, slug } of PROJECTS) {
    const exists = await strapi.db.query(uid).findOne({ where: { title: ro.title, locale: 'ro' } });
    if (exists) continue;

    const roEntry = await strapi.entityService.create(uid, { data: { ...ro, slug, locale: 'ro', publishedAt: new Date() } });
    const enEntry = await strapi.entityService.create(uid, {
      data: { ...en, slug, externalUrl: ro.externalUrl, order: ro.order, locale: 'en', publishedAt: new Date(), localizations: [roEntry.id] },
      populate: ['localizations'],
    });
    await locSvc.syncLocalizations(enEntry, { model });
    strapi.log.info(`Seed: proiect „${ro.title}" creat (ro #${roEntry.id}, en #${enEntry.id}).`);
  }
};

// Expus pentru scripturi one-off (ex. adăugarea unui proiect nou pe o instalare existentă,
// unde seedProjects nu mai rulează pentru că există deja proiecte).
module.exports.PROJECTS = PROJECTS;
