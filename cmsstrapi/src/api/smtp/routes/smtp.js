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
  ],
};
