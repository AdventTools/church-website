import churchLogo from './extensions/church-logo.png';
import favicon from './extensions/favicon.png';
import { initMobileAdmin } from './extensions/mobileAdmin';
import { hideVendorNewsletter } from './extensions/hideVendorNewsletter';
import { registerEditViewPanels } from './extensions/editViewPanels.jsx';

// Strapi's default `en` shows dates month-first; `en-GB` has the same texts, with the day first.
const DAY_FIRST_LOCALE = 'en-GB';
const ADMIN_LANGUAGE_KEY = 'strapi-admin-language';
const BRAND_MESSAGES = {
  'Auth.form.welcome.title': 'Biserica „Speranța” Cluj-Napoca',
  'Auth.form.welcome.subtitle': 'Administrare conținut',
  'Auth.form.button.login.strapi': 'Autentificare',
  'app.components.LeftMenu.navbrand.title': 'Speranța',
  'app.components.LeftMenu.navbrand.workplace': 'Administrare',
};

export default {
  config: {
    // Sigla bisericii peste tot, în locul identității Strapi
    auth: { logo: churchLogo },
    menu: { logo: churchLogo },
    // Favicon = emblema site-ului, în alb-negru (același simbol ca pe adventistcluj.ro).
    head: { favicon, title: 'Speranța · Administrare' },
    locales: [DAY_FIRST_LOCALE],
    tutorials: false,
    notifications: { releases: false },
    theme: {
      light: {
        colors: {
          primary100: '#fbeae7',
          primary200: '#f0c3ba',
          primary500: '#c0351b',
          primary600: '#a52d16',
          primary700: '#8a2512',
          buttonPrimary500: '#c0351b',
          buttonPrimary600: '#a52d16',
        },
      },
    },
    translations: {
      en: BRAND_MESSAGES,
      [DAY_FIRST_LOCALE]: BRAND_MESSAGES,
    },
  },
  bootstrap(app) {
    // Runs before Strapi reads the stored language, so the first render is already day-first.
    const storedLocale = localStorage.getItem(ADMIN_LANGUAGE_KEY);
    if (!storedLocale || storedLocale === 'en') localStorage.setItem(ADMIN_LANGUAGE_KEY, DAY_FIRST_LOCALE);

    // Panou utilizabil pe telefon (sertar pentru bara principală, conținut full-width).
    initMobileAdmin();
    hideVendorNewsletter();
    // Panouri în bara laterală a ecranului de editare (Strapi 5): test SMTP, avertisment
    // eveniment-duplicat, „Aplică un șablon". (Coloana „Limba” compactă din v4 nu are
    // echivalent în v5 — Content Manager afișează nativ limbile disponibile.)
    registerEditViewPanels(app);

    // Ecran propriu pentru invitațiile în așteptare. Strapi arată linkul de înregistrare o singură
    // dată, la invitare; dacă mesajul se pierde sau ai închis fereastra, colegul rămâne pe dinafară
    // și nu se vede nicăieri. Aici sunt toate, cu buton de retrimitere.
    app.addSettingsLink(
      { id: 'site', intlLabel: { id: 'site.settings.section', defaultMessage: 'Site' } },
      {
        id: 'invitations',
        to: 'invitations',
        intlLabel: { id: 'site.settings.invitations', defaultMessage: 'Invitații' },
        Component: () => import('./extensions/InvitationsPage').then((mod) => ({ default: mod.default })),
        permissions: [],
      },
    );
  },
};
