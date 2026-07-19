import churchLogo from './extensions/church-logo.png';
import faviconBw from './extensions/favicon-bw.png';
import SmtpTestButton from './extensions/SmtpTestButton';
import EventDuplicateWarning from './extensions/EventDuplicateWarning';
import EventTemplatePicker from './extensions/EventTemplatePicker';
import { registerCompactLocaleColumn } from './extensions/LocaleCodesCell';

export default {
  config: {
    // Sigla bisericii peste tot, în locul identității Strapi
    auth: { logo: churchLogo },
    menu: { logo: churchLogo },
    // Favicon = emblema site-ului, în alb-negru (același simbol ca pe adventistcluj.ro).
    head: { favicon: faviconBw, title: 'Speranța · Administrare' },
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
    // Coloana i18n din listă: antet „Limba” + doar codul limbii (RO, EN) — economisește spațiu în grid.
    registerCompactLocaleColumn(app);
    // Buton „Trimite e-mail de test” în ecranul setărilor SMTP.
    app.injectContentManagerComponent('editView', 'right-links', {
      name: 'smtp-test-button',
      Component: SmtpTestButton,
    });
    // Avertisment „eveniment duplicat în aceeași zi” în bara laterală a evenimentului.
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'event-duplicate-warning',
      Component: EventDuplicateWarning,
    });
    // Dropdown „Aplică un șablon" — în bara de sus a evenimentului (lângă Salvează), vizibil imediat.
    app.injectContentManagerComponent('editView', 'right-links', {
      name: 'event-template-picker',
      Component: EventTemplatePicker,
    });
  },
};
