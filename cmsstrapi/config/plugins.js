module.exports = ({ env }) => ({
  // SMTP-ul se administrează ÎNTR-UN SINGUR LOC: panoul CMS → „E-mail (SMTP)" (inclusiv parola,
  // care se poate doar înlocui, niciodată citi). E-mailurile de sistem ale Strapi (resetare
  // parolă, invitații de administrator) sunt rutate către acele setări în `src/index.js`.
  //
  // Ce urmează rămâne DOAR ca plasă de siguranță: se folosește dacă setările din CMS lipsesc
  // (ex. instalare nouă, înainte de prima completare a panoului).
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'localhost'),
        port: env.int('SMTP_PORT', 587),
        secure: env.int('SMTP_PORT', 587) === 465, // 465 = TLS implicit; 587 = STARTTLS
        requireTLS: env.int('SMTP_PORT', 587) === 587,
        auth: {
          user: env('SMTP_USER'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', env('SMTP_USER')),
        defaultReplyTo: env('SMTP_FROM', env('SMTP_USER')),
      },
    },
  },
});
