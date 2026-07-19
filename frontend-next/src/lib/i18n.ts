import type { Locale } from './types';

export const HTML_LANG: Record<Locale, string> = { ro: 'ro', en: 'en' };
export const OG_LOCALE: Record<Locale, string> = { ro: 'ro_RO', en: 'en_GB' };
export const INTL_TAG: Record<Locale, string> = { ro: 'ro-RO', en: 'en-GB' };

// Prefixează un path cu locale-ul: RO la rădăcină, EN la /en.
export function localePath(locale: Locale, path = '/'): string {
  if (locale === 'ro') return path || '/';
  if (!path || path === '/') return '/en';
  return `/en${path}`;
}

// Scoate ORICE prefix de locale dintr-un pathname (ro sau en). Server-side, usePathname()
// întoarce calea rescrisă intern (/ro/...), deci trebuie tratat și prefixul implicit.
export function stripLocale(pathname: string): string {
  for (const l of ['ro', 'en']) {
    if (pathname === `/${l}`) return '/';
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

export function isLocale(v: string): v is Locale {
  return v === 'ro' || v === 'en';
}

type Dict = {
  nav: { home: string; about: string; whoWeAre: string; beliefs: string; firstVisit: string; projects: string; blog: string; events: string; schedule: string; contact: string };
  projects: { title: string; meta: string; learnMore: string; visitSite: string; intro: string };
  blog: { title: string; meta: string; readMore: string; by: string; empty: string; intro: string };
  header: {
    live: string;
    liveNow: string;
    nextProgram: string;
    liveWatch: string;
    skip: string;
    homeAria: string;
    openMenu: string;
    closeMenu: string;
    liveAriaWatch: string;
    liveAriaRecent: string;
    switchTo: string;
    navMain: string;
    navMobile: string;
    langGroup: string;
  };
  hero: { cta: string; scrollAria: string; defaultTitle: string };
  home: {
    about: string;
    aboutCta: string;
    sermons: string;
    sermonsCta: string;
    schedule: string;
    scheduleCta: string;
    comingUp: string;
    events: string;
    eventsCta: string;
    eventsUpcomingLead: string;
    eventsPastLead: string;
    fvTitle: string;
    fvText: string;
    valuesTitle: string;
    valuesMore: string;
    beliefsTitle: string;
    beliefsMore: string;
  };
  about: { title: string; history: string; gallery: string; meta: string };
  schedule: { title: string; empty: string; sunset: string; meta: string };
  events: { title: string; upcoming: string; past: string; empty: string; readMore: string; meta: string; showMore: string; showLess: string; upcomingIntro: string; pastIntro: string };
  contact: {
    title: string;
    details: string;
    phone: string;
    email: string;
    pastor: string;
    address: string;
    formTitle: string;
    meta: string;
    f: {
      lastName: string;
      firstName: string;
      email: string;
      phone: string;
      message: string;
      send: string;
      sending: string;
      sent: string;
      error: string;
    };
  };
  firstVisit: { faqTitle: string; closingTitle: string; ctaContact: string; ctaSchedule: string; meta: string };
  footer: { social: string; nav: string; useful: string };
  music: {
    heading: string;
    play: string;
    conductors: string;
    more: string;
    less: string;
  };
  notFound: { title: string; text: string; cta: string };
  cookies: { text: string; accept: string; reject: string };
  a11y: { close: string; prevPhoto: string; nextPhoto: string; openPhoto: string; galleryAlt: string };
};

const DICT: Record<Locale, Dict> = {
  ro: {
    nav: { home: 'Acasă', about: 'Despre noi', whoWeAre: 'Cine suntem', beliefs: 'Ce credem', firstVisit: 'Prima ta vizită', projects: 'Proiecte', blog: 'Blog', events: 'Evenimente', schedule: 'Program', contact: 'Contact' },
    projects: {
      title: 'Proiecte',
      meta: 'Proiectele Bisericii Adventiste „Speranța” din Cluj-Napoca — inițiative de sănătate, sprijin social și tineret prin care slujim comunitatea clujeană.',
      learnMore: 'Află mai multe',
      visitSite: 'Vizitează site-ul proiectului',
      intro: 'Credința prinde viață în fapte. Iată câteva dintre proiectele prin care comunitatea noastră din Cluj slujește orașul și oamenii lui.',
    },
    blog: {
      title: 'Blog',
      meta: 'Blogul Bisericii Adventiste „Speranța” din Cluj-Napoca — gânduri din Cuvânt, vești din viața comunității și încurajări pentru fiecare zi.',
      readMore: 'Citește articolul',
      by: 'de',
      empty: 'În curând vom publica primele articole. Revino curând!',
      intro: 'Gânduri din Cuvânt, vești din viața comunității și încurajări pentru drumul tău.',
    },
    header: {
      live: 'LIVE',
      liveNow: 'ÎN DIRECT',
      nextProgram: 'Următorul program:',
      liveWatch: 'În direct acum — urmărește',
      skip: 'Sari la conținut',
      homeAria: 'Acasă',
      openMenu: 'Deschide meniul',
      closeMenu: 'Închide meniul',
      liveAriaWatch: 'Urmărește transmisiunea live — în direct acum',
      liveAriaRecent: 'Vezi ultimele transmisiuni',
      switchTo: 'English',
      navMain: 'Navigație principală',
      navMobile: 'Navigație mobilă',
      langGroup: 'Limbă',
    },
    hero: { cta: 'Află programul', scrollAria: 'Derulează în jos', defaultTitle: 'Bine ați venit' },
    home: {
      about: 'Cine suntem',
      aboutCta: 'Află istoricul bisericii',
      sermons: 'Transmisiuni recente',
      sermonsCta: 'Vezi evenimentele',
      schedule: 'Program',
      scheduleCta: 'Vezi întregul program',
      comingUp: 'Urmează:',
      events: 'Evenimente',
      eventsCta: 'Vezi toate evenimentele',
      eventsUpcomingLead: 'Ce urmează la biserica noastră.',
      eventsPastLead: 'Câteva dintre evenimentele noastre recente.',
      fvTitle: 'Vii pentru prima dată?',
      fvText: 'Îți spunem tot ce trebuie să știi: program, parcare, ținută și la ce să te aștepți.',
      valuesTitle: 'Ce ne definește',
      valuesMore: 'Citește mai multe despre ce credem',
      beliefsTitle: 'Ce credem',
      beliefsMore: 'Citește mai mult',
    },
    about: { title: 'Despre noi', history: 'Istoric', gallery: 'Galerie', meta: 'Povestea și valorile Bisericii Adventiste „Speranța” din Cluj-Napoca — istoricul comunității și galerie foto.' },
    schedule: { title: 'Program', empty: 'Programul va fi disponibil în curând.', sunset: 'Apusul soarelui — ora', meta: 'Programul serviciilor și întâlnirilor Bisericii Adventiste „Speranța” Cluj-Napoca. Serviciul divin are loc sâmbăta, pe Strada Moților 47.' },
    events: {
      title: 'Evenimente',
      upcoming: 'Evenimente viitoare',
      past: 'Evenimente trecute',
      empty: 'Momentan nu sunt evenimente programate. Revino în curând!',
      readMore: 'Citește mai mult',
      meta: 'Evenimentele Bisericii Adventiste „Speranța” din Cluj-Napoca — întâlniri, concerte, conferințe și activități ale comunității.',
      showMore: 'Vezi mai multe',
      showLess: 'Vezi mai puține',
      upcomingIntro: 'În ordine cronologică, începând cu cel mai apropiat.',
      pastIntro: 'Din arhiva comunității — cele mai recente întâi.',
    },
    contact: {
      title: 'Contact',
      details: 'Date de contact',
      phone: 'Telefon',
      email: 'E-mail',
      pastor: 'Pastor',
      address: 'Adresă',
      formTitle: 'Trimite-ne un mesaj',
      meta: 'Contactează Biserica Adventistă „Speranța” din Cluj-Napoca — adresă, telefon, e-mail și formular de mesaj. Strada Moților 47.',
      f: {
        lastName: 'Nume',
        firstName: 'Prenume',
        email: 'E-Mail',
        phone: 'Telefon',
        message: 'Mesajul tău',
        send: 'Trimite',
        sending: 'Se trimite…',
        sent: 'Mesajul tău a fost trimis cu succes!',
        error: 'A apărut o eroare. Te rugăm să încerci din nou.',
      },
    },
    firstVisit: {
      faqTitle: 'Întrebări frecvente',
      closingTitle: 'Ne bucurăm să te cunoaștem',
      ctaContact: 'Scrie-ne un mesaj',
      ctaSchedule: 'Vezi programul complet',
      meta: 'Vii prima dată la Biserica Adventistă „Speranța” din Cluj-Napoca? Află la ce oră încep serviciile de sâmbătă, unde parchezi, cum te îmbraci, unde stau copiii și la ce să te aștepți.',
    },
    footer: { social: 'Social media', nav: 'Navigare', useful: 'Linkuri utile' },
    music: {
      heading: 'Ascultă și privește',
      play: 'Redă',
      conductors: 'Dirijori de-a lungul timpului',
      more: 'Vezi mai multe',
      less: 'Vezi mai puține',
    },
    notFound: { title: 'Pagina nu a fost găsită', text: 'Ne pare rău, pagina căutată nu există sau a fost mutată.', cta: 'Înapoi acasă' },
    cookies: {
      text: 'Folosim cookie-uri doar pentru a înțelege cum este folosit site-ul (statistici anonime). Le activăm numai cu acordul tău.',
      accept: 'Accept',
      reject: 'Refuz',
    },
    a11y: {
      close: 'Închide',
      prevPhoto: 'Fotografia anterioară',
      nextPhoto: 'Fotografia următoare',
      openPhoto: 'Deschide fotografia',
      galleryAlt: 'Fotografie din viața comunității Adventiste „Speranța” Cluj-Napoca',
    },
  },
  en: {
    nav: { home: 'Home', about: 'About us', whoWeAre: 'Who we are', beliefs: 'What we believe', firstVisit: 'Your first visit', projects: 'Projects', blog: 'Blog', events: 'Events', schedule: 'Schedule', contact: 'Contact' },
    projects: {
      title: 'Projects',
      meta: 'The projects of the Speranța Seventh-day Adventist Church in Cluj-Napoca — health, social-care, and youth initiatives through which we serve the community of Cluj.',
      learnMore: 'Learn more',
      visitSite: "Visit the project's website",
      intro: 'Faith comes to life through deeds. Here are some of the projects through which our community in Cluj serves the city and its people.',
    },
    blog: {
      title: 'Blog',
      meta: 'The blog of the Speranța Seventh-day Adventist Church in Cluj-Napoca — thoughts from Scripture, news from the life of our community, and encouragement for every day.',
      readMore: 'Read the article',
      by: 'by',
      empty: 'We will publish our first articles soon. Check back shortly!',
      intro: 'Thoughts from Scripture, news from the life of our community, and encouragement for your journey.',
    },
    header: {
      live: 'LIVE',
      liveNow: 'LIVE NOW',
      nextProgram: 'Next:',
      liveWatch: 'Live now — watch',
      skip: 'Skip to content',
      homeAria: 'Home',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      liveAriaWatch: 'Watch the live broadcast — on air now',
      liveAriaRecent: 'See the latest broadcasts',
      switchTo: 'Română',
      navMain: 'Main navigation',
      navMobile: 'Mobile navigation',
      langGroup: 'Language',
    },
    hero: { cta: 'See the schedule', scrollAria: 'Scroll down', defaultTitle: 'Welcome' },
    home: {
      about: 'Who we are',
      aboutCta: "Discover the church's history",
      sermons: 'Recent broadcasts',
      sermonsCta: 'See the events',
      schedule: 'Schedule',
      scheduleCta: 'See the full schedule',
      comingUp: 'Coming up:',
      events: 'Events',
      eventsCta: 'See all events',
      eventsUpcomingLead: "What's coming up at our church.",
      eventsPastLead: 'A few of our recent events.',
      fvTitle: 'Visiting for the first time?',
      fvText: "We'll tell you everything you need to know: schedule, parking, dress, and what to expect.",
      valuesTitle: 'What defines us',
      valuesMore: 'Read more about what we believe',
      beliefsTitle: 'What we believe',
      beliefsMore: 'Read more',
    },
    about: { title: 'About us', history: 'Our history', gallery: 'Gallery', meta: 'The story and values of the Speranța (Hope) Seventh-day Adventist Church in Cluj-Napoca — our community history and photo gallery.' },
    schedule: { title: 'Schedule', empty: 'The schedule will be available soon.', sunset: 'Sunset —', meta: 'The schedule of services and gatherings of the Speranța Seventh-day Adventist Church in Cluj-Napoca. Divine Service is held on Saturdays, at Moților Street 47.' },
    events: {
      title: 'Events',
      upcoming: 'Upcoming events',
      past: 'Past events',
      empty: 'There are no events scheduled right now. Check back soon!',
      readMore: 'Read more',
      meta: 'Events of the Speranța Seventh-day Adventist Church in Cluj-Napoca — gatherings, concerts, conferences, and community activities.',
      showMore: 'See more',
      showLess: 'See fewer',
      upcomingIntro: 'In chronological order, starting with the nearest.',
      pastIntro: 'From the community archive — most recent first.',
    },
    contact: {
      title: 'Contact',
      details: 'Contact details',
      phone: 'Phone',
      email: 'E-mail',
      pastor: 'Pastor',
      address: 'Address',
      formTitle: 'Send us a message',
      meta: 'Contact the Speranța Seventh-day Adventist Church in Cluj-Napoca — address, phone, e-mail, and message form. Moților Street 47.',
      f: {
        lastName: 'Last name',
        firstName: 'First name',
        email: 'E-mail',
        phone: 'Phone',
        message: 'Your message',
        send: 'Send',
        sending: 'Sending…',
        sent: 'Your message has been sent successfully!',
        error: 'Something went wrong. Please try again.',
      },
    },
    firstVisit: {
      faqTitle: 'Frequently asked questions',
      closingTitle: 'We look forward to meeting you',
      ctaContact: 'Write us a message',
      ctaSchedule: 'See the full schedule',
      meta: 'Visiting the Speranța Seventh-day Adventist Church in Cluj-Napoca for the first time? Find out when Saturday services start, where to park, what to wear, where the children go, and what to expect.',
    },
    footer: { social: 'Social media', nav: 'Navigation', useful: 'Useful links' },
    music: {
      heading: 'Listen & watch',
      play: 'Play',
      conductors: 'Conductors over the years',
      more: 'See more',
      less: 'Show less',
    },
    notFound: { title: 'Page not found', text: "Sorry, the page you're looking for doesn't exist or has been moved.", cta: 'Back home' },
    cookies: {
      text: 'We use cookies only to understand how the site is used (anonymous statistics). We enable them only with your consent.',
      accept: 'Accept',
      reject: 'Reject',
    },
    a11y: {
      close: 'Close',
      prevPhoto: 'Previous photo',
      nextPhoto: 'Next photo',
      openPhoto: 'Open photo',
      galleryAlt: 'A photo from the life of the Speranța Adventist community in Cluj-Napoca',
    },
  },
};

export function t(locale: Locale): Dict {
  return DICT[locale] ?? DICT.ro;
}
