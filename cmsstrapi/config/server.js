module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 80),
  // URL public opțional (ex. https://cms.adventistcluj.ro); gol => dedus din request.
  url: env('PUBLIC_URL', undefined),
  // Rulează în spatele nginx: acceptă X-Forwarded-* (https corect etc.).
  proxy: true,
  app: {
    keys: env.array('APP_KEYS'),
  },
});
