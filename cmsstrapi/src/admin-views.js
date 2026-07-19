'use strict';

// Etichete în română + text de ajutor (apare sub câmp) + grupare logică a câmpurilor + ascunderea
// câmpurilor tehnice (slug) în ecranele de editare. Se aplică la fiecare pornire (impune consecvența).
// [label, description, visible?] — visible:false ascunde câmpul.

const CFG = {
  'api::event.event': {
    labels: {
      title: ['Titlul evenimentului', 'Numele evenimentului, ex. „Concert de colinde”.'],
      slug: [null, null, false],
      oldSlugs: [null, null, false],
      startDate: ['Data de început', 'Prima zi a evenimentului.'],
      endDate: ['Data de sfârșit', 'Ultima zi. Pentru un eveniment de o singură zi, pune aceeași dată ca la început.'],
      intro: ['Rezumat scurt (opțional)', 'O propoziție care apare în listă și în previzualizări.'],
      content: ['Descriere', 'Despre ce este evenimentul.'],
      cover: ['Imagine (opțional)', 'O poză reprezentativă pentru eveniment.'],
      facebookLink: ['Link Facebook (opțional)', 'Pagina de Facebook a evenimentului, dacă există.'],
      locationName: ['Alt loc — nume (opțional)', 'Completează DOAR dacă evenimentul NU e la biserică (ex. o sală). Altfel se subînțelege adresa bisericii.'],
      locationAddress: ['Alt loc — adresă (opțional)', 'Adresa locului, dacă e altul decât biserica.'],
      locationMapLink: ['Alt loc — link hartă (opțional)', 'Link Google Maps către locul evenimentului.'],
    },
    layout: [['title'], ['startDate', 'endDate'], ['intro'], ['content'], ['cover'], ['facebookLink'], ['locationName', 'locationAddress'], ['locationMapLink']],
  },
  'api::project.project': {
    labels: {
      title: ['Numele proiectului', 'Ex. „AMiCUS”. Acesta e titlul afișat pe site.'],
      slug: [null, null, false],
      oldSlugs: [null, null, false],
      summary: ['Rezumat scurt', '1–2 propoziții. Apar pe card și în previzualizări.'],
      content: ['Descriere', 'Textul principal al proiectului.'],
      cover: ['Imagine (opțional)', 'Poza de copertă a proiectului.'],
      externalUrl: ['Site propriu (opțional)', 'Dacă proiectul are site separat, ex. https://amicus.ro.'],
      ensembles: ['Secțiuni (ex. formații muzicale)', 'Subsecțiuni cu nume propriu, dirijori și videouri (folosite la proiectul „Muzică”).'],
    },
    layout: [['title'], ['summary'], ['content'], ['cover'], ['externalUrl'], ['ensembles']],
  },
  'api::article.article': {
    labels: {
      title: ['Titlul articolului', 'Titlul afișat pe blog.'],
      slug: [null, null, false],
      oldSlugs: [null, null, false],
      excerpt: ['Rezumat scurt', 'Apare pe card și în listă (max. 300 caractere).'],
      content: ['Conținutul articolului', 'Scrie liber: titluri, îngroșat, liste, poze. Site-ul îl aranjează frumos.'],
      cover: ['Imagine de copertă (opțional)', 'Poza principală a articolului.'],
      author: ['Autor', 'Numele celui care scrie.'],
      date: ['Data', 'Data publicării.'],
    },
    layout: [['title'], ['author', 'date'], ['excerpt'], ['content'], ['cover']],
  },
  'api::event-template.event-template': {
    labels: {
      name: ['Numele șablonului', 'Ex. „Sfânta Cină”. Apare în lista din care alegi la un eveniment.'],
      title: ['Titlu (opțional)', 'Devine titlul evenimentului când aplici șablonul. Gol = nu schimbă titlul.'],
      intro: ['Rezumat scurt (opțional)', ''],
      content: ['Descriere (opțional)', ''],
      cover: ['Imagine (opțional)', ''],
      locationName: ['Alt loc — nume (opțional)', 'Completează doar dacă evenimentul NU e la biserică.'],
      locationAddress: ['Alt loc — adresă (opțional)', ''],
      locationMapLink: ['Alt loc — link hartă (opțional)', ''],
      facebookLink: ['Link Facebook (opțional)', ''],
    },
    layout: [['name'], ['title'], ['intro'], ['content'], ['cover'], ['facebookLink'], ['locationName', 'locationAddress'], ['locationMapLink']],
  },
  'api::first-visit.first-visit': {
    labels: {
      title: ['Titlul paginii', ''],
      subtitle: ['Subtitlu', ''],
      intro: ['Introducere', 'Textul de început al paginii.'],
      highlights: ['Carduri informative', 'Puncte cheie cu iconiță (când ne întâlnim, parcare, ținută etc.).'],
      faqs: ['Întrebări frecvente', 'Perechi întrebare–răspuns.'],
      closingTitle: ['Titlu de final', ''],
      closingText: ['Text de final', ''],
    },
  },
  'api::contact.contact': {
    labels: {
      pastor: ['Pastor', 'Numele pastorului.'],
      phone: ['Telefon', ''],
      email: ['E-mail de contact', 'Adresa afișată public pe pagina de contact.'],
      address: ['Adresă', ''],
      mapsIframeSrc: ['Hartă (link Google Maps)', 'În Google Maps: „Partajează” → „Încorporează o hartă” → copiază linkul (cel din „src”). Se poate lipi și tot codul, luăm noi linkul.'],
    },
  },
  'api::program.program': {
    labels: {
      name: ['Numele programului', 'Ex. „Școala de Sabat”, „Serviciul Divin”.'],
      day: ['Ziua', ''],
      time: ['Ora', 'Format 24h, ex. 10:00.'],
      live: ['Se transmite live?', 'Bifează dacă programul e transmis online.'],
      expirationDate: ['Se ascunde după data (opțional)', 'Lasă gol pentru programe permanente.'],
    },
    layout: [['name'], ['day', 'time'], ['live', 'expirationDate']],
  },
  'api::home-page.home-page': {
    labels: {
      title: ['Titlu (imaginea mare de sus)', ''],
      description: ['Descriere scurtă', 'Apare sub titlu și în rezultatele Google.'],
      aboutUs: ['Text „Cine suntem”', 'Prezentarea comunității de pe prima pagină.'],
      values: ['Valori („Ce ne definește”)', 'Cardurile cu valorile bisericii.'],
    },
    layout: [['title'], ['description'], ['aboutUs'], ['values']],
  },
  'api::church-info.church-info': {
    labels: {
      churchName: ['Numele bisericii', ''],
      tabTitle: ['Titlu în fila browserului', ''],
      description: ['Descriere (pentru Google)', ''],
      address: ['Adresă', ''],
      nameLogo: ['Logo', ''],
      favicon: ['Iconiță filă (favicon)', ''],
      youtubeChannelName: ['Nume canal YouTube', ''],
      youtubeLink: ['Link YouTube', ''],
      facebookLink: ['Link Facebook', ''],
      instagramLink: ['Link Instagram', ''],
      locationMapLink: ['Link hartă', ''],
    },
  },
  'api::gallery.gallery': {
    labels: {
      description: ['Descriere galerie', ''],
      images: ['Fotografii', 'Trage pozele în ordinea dorită.'],
    },
  },
  'api::history.history': {
    labels: {
      period: ['Perioada', 'Ex. „1995–2000” sau „La început”.'],
      description: ['Descriere', ''],
      order: ['Ordine', 'Ordinea afișării (crescător). Pune 10, 20, 30… ca să poți insera ușor una nouă între ele.'],
    },
    layout: [['period', 'order'], ['description']],
  },
  'api::beliefs.beliefs': {
    labels: {
      title: ['Titlu', ''],
      intro: ['Introducere', ''],
      content: ['Conținut', 'Scrie liber: titluri, text, poze.'],
    },
  },
};

// Etichete pentru câmpurile componentelor (secțiuni de proiect, videouri, persoane, carduri etc.).
const COMPONENTS = {
  'project.ensemble': {
    labels: {
      name: ['Titlul secțiunii', 'Ex. „Corul bisericii”, „Galerie foto”, „Filmări”.'],
      description: ['Descriere (opțional)', 'Câteva cuvinte despre secțiune.'],
      peopleLabel: ['Eticheta persoanelor (opțional)', 'Ex. „Dirijori de-a lungul timpului”, „Echipă”, „Voluntari”.'],
      conductors: ['Persoane (opțional)', 'Lista de nume (ex. dirijori, echipă).'],
      videos: ['Videouri (opțional)', 'Clipuri YouTube ale secțiunii.'],
      images: ['Galerie foto (opțional)', 'Fotografii pentru această secțiune.'],
    },
  },
  'project.video': {
    labels: {
      title: ['Titlu (opțional)', 'Doar pentru tine, în administrare — nu apare pe site.'],
      url: ['Link YouTube', 'Ex. https://www.youtube.com/watch?v=...'],
    },
  },
  'project.person': { labels: { name: ['Nume', ''] } },
  'page.highlight': {
    labels: {
      icon: ['Iconiță', 'Numele iconiței (ex. clock, parking, kids).'],
      title: ['Titlu', ''],
      text: ['Text', ''],
    },
  },
  'page.faq': { labels: { question: ['Întrebare', ''], answer: ['Răspuns', ''] } },
  'home.value': {
    labels: {
      icon: ['Iconiță', 'Ex. bible, community, hope, health, prayer, love, music.'],
      title: ['Titlu', ''],
      text: ['Text', ''],
    },
  },
};

async function applyGroup(strapi, entries, keyPrefix, getModel) {
  for (const [uid, spec] of Object.entries(entries)) {
    const key = `${keyPrefix}${uid}`;
    const row = await strapi.db.query('strapi::core-store').findOne({ where: { key } });
    if (!row) continue;
    const conf = JSON.parse(row.value);
    const model = getModel(uid);
    if (!model) continue;

    for (const [field, meta] of Object.entries(spec.labels || {})) {
        const md = conf.metadatas[field];
        if (!md) continue;
        const [label, description, visible] = meta;
        if (label != null) {
          if (md.edit) md.edit.label = label;
          if (md.list) md.list.label = label;
        }
        if (description != null && md.edit) md.edit.description = description;
        if (visible === false && md.edit) md.edit.visible = false;
      }

      if (spec.layout) {
        const sizeOf = (name) => {
          const a = model.attributes[name];
          if (!a) return 6;
          if (['text', 'richtext', 'blocks', 'json', 'component', 'dynamiczone'].includes(a.type)) return 12;
          if (a.type === 'boolean') return 4;
          return 6;
        };
        conf.layouts.edit = spec.layout.map((names) => names.filter((n) => model.attributes[n]).map((name) => ({ name, size: sizeOf(name) })));
      }

      await strapi.db.query('strapi::core-store').update({ where: { key }, data: { value: JSON.stringify(conf) } });
    }
}

module.exports = async function configureAdminViews(strapi) {
  try {
    await applyGroup(strapi, CFG, 'plugin_content_manager_configuration_content_types::', (u) => strapi.contentType(u));
    await applyGroup(strapi, COMPONENTS, 'plugin_content_manager_configuration_components::', (u) => strapi.components[u]);
    strapi.log.info('Admin: etichete RO + ajutor + grupare aplicate pe ecranele de editare.');
  } catch (err) {
    strapi.log.error(`configureAdminViews: ${err.message}`);
  }
};
