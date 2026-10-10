'use strict';

const { superAdminFromToken } = require('../../../admin-auth');
const { sendInvitation, receipt, registerUrl } = require('../../../invitations');

module.exports = {
  // Conturile invitate care încă n-au intrat. Includem și linkul: panoul îl arată o singură dată,
  // imediat după invitare, iar dacă l-ai închis nu mai ai de unde să-l iei.
  async list(ctx) {
    if (!(await superAdminFromToken(strapi, ctx))) return ctx.unauthorized();

    const users = await strapi.db.query('admin::user').findMany({
      where: { isActive: false },
      populate: ['roles'],
      orderBy: { createdAt: 'desc' },
    });

    ctx.body = {
      data: users
        .filter((u) => u.registrationToken)
        .map((u) => ({
          id: u.id,
          email: u.email,
          name: [u.firstname, u.lastname].filter(Boolean).join(' '),
          roles: (u.roles || []).map((r) => r.name).join(', '),
          createdAt: u.createdAt,
          link: registerUrl(strapi, u.registrationToken),
        })),
    };
  },

  async resend(ctx) {
    if (!(await superAdminFromToken(strapi, ctx))) return ctx.unauthorized();

    const id = Number(ctx.params.id);
    const user = id ? await strapi.db.query('admin::user').findOne({ where: { id } }) : null;
    if (!user) return ctx.notFound('Contul nu există.');
    if (!user.registrationToken) return ctx.badRequest('Contul e deja activ — nu mai are ce invitație să primească.');

    try {
      const { info } = await sendInvitation(strapi, user);
      strapi.log.info(`Invitație retrimisă către ${user.email} — ${receipt(info)}`);
      ctx.body = { ok: true, to: user.email };
    } catch (err) {
      strapi.log.error(`Invitația către ${user.email} NU a plecat: ${err.message}`);
      ctx.body = { ok: false, error: err.message };
    }
  },
};
