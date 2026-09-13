module.exports = ({ env }) => [
  'strapi::logger',
  'global::noindex',
  'global::root-redirect',
  'strapi::errors',
  'strapi::security',
  {
    // Implicit, Strapi reflectă orice origine. Site-ul public nu cheamă CMS-ul din browser
    // (datele se aduc pe server, prin 127.0.0.1), deci lista poate fi strânsă la panoul propriu
    // plus site-ul. CORS_ORIGINS în .env acceptă mai multe, separate prin virgulă.
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGINS', [env('PUBLIC_URL', 'http://localhost:1337'), env('SITE_URL', 'http://localhost:3000')]),
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
