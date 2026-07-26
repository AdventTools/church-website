'use strict';

// Rute custom (fără CRUD public). Panoul de administrare gestionează setările prin Content Manager.
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/smtp/send',
      handler: 'smtp.send',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/smtp/test',
      handler: 'smtp.test',
      config: { auth: false },
    },
    // Parola: se poate SCRIE din panou, dar nu se poate citi niciodată (nu există rută de citire).
    {
      method: 'POST',
      path: '/smtp/password',
      handler: 'smtp.setPassword',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/smtp/password-status',
      handler: 'smtp.passwordStatus',
      config: { auth: false },
    },
  ],
};
