'use strict';

// Invitațiile în așteptare, pentru ecranul propriu din Setări. `auth: false` înseamnă doar că nu
// intervine stratul de utilizatori publici — controllerul cere token de Super Admin.
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/invitations',
      handler: 'invitation.list',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/invitations/:id/resend',
      handler: 'invitation.resend',
      config: { auth: false },
    },
  ],
};
