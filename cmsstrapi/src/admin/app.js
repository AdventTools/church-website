import churchLogo from './extensions/church-logo.png';
import favicon from './extensions/favicon.png';
import { initMobileAdmin } from './extensions/mobileAdmin';
import { registerEditViewPanels } from './extensions/editViewPanels.jsx';

export default {
  config: {
    // Sigla bisericii peste tot, în locul identității Strapi
    auth: { logo: churchLogo },
    menu: { logo: churchLogo },
    // Favicon = emblema site-ului, în alb-negru (același simbol ca pe adventistcluj.ro).
    head: { favicon, title: 'Speranța · Administrare' },
    locales: [],
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
      en: {
        'Auth.form.welcome.title': 'Biserica „Speranța” Cluj-Napoca',
        'Auth.form.welcome.subtitle': 'Administrare conținut',
        'Auth.form.button.login.strapi': 'Autentificare',
        'app.components.LeftMenu.navbrand.title': 'Speranța',
        'app.components.LeftMenu.navbrand.workplace': 'Administrare',
      },
    },
  },
  bootstrap(app) {
    // Panou utilizabil pe telefon (sertar pentru bara principală, conținut full-width).
    initMobileAdmin();
    // Panouri în bara laterală a ecranului de editare (Strapi 5): test SMTP, avertisment
    // eveniment-duplicat, „Aplică un șablon". (Coloana „Limba” compactă din v4 nu are
    // echivalent în v5 — Content Manager afișează nativ limbile disponibile.)
    registerEditViewPanels(app);
  },
};
