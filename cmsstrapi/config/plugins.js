module.exports = ({ env }) => ({
  // E-mailurile de SISTEM ale Strapi (invitații pentru administratori, resetare parolă) trec
  // prin SMTP. Formularul de contact folosește serviciul custom `api::smtp` (setări din CMS);
  // acesta e pentru plugin-ul de email. Parola stă doar în env (`SMTP_PASSWORD`).
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
