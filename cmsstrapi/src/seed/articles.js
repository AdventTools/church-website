'use strict';

// Seed inițial blog: un articol de întâmpinare (RO + EN legate). Idempotent după titlul RO.

const ARTICLES = [
  {
    slug: 'bine-ai-venit-pe-blogul-nostru',
    ro: {
      title: 'Bine ai venit pe blogul nostru',
      excerpt:
        'Am deschis un spațiu unde împărtășim gânduri din Cuvânt, vești din viața comunității din Cluj și încurajări pentru fiecare zi.',
      author: 'Biserica „Speranța” Cluj',
      content:
        'Ne bucurăm să te avem alături! Acest blog este locul în care vom împărtăși, din când în când:\n\n- **gânduri și încurajări** din Biblie;\n- **vești din viața comunității** din Cluj;\n- **resurse** pentru o viață trăită frumos și cu sens.\n\n## De ce un blog?\n\nPentru că poveștile și cuvintele bune merită împărtășite. Credem că fiecare articol poate fi o mică fereastră de speranță pentru cineva.\n\n> „Cuvintele prietenoase sunt un fagure de miere: dulci pentru suflet și sănătoase pentru oase." — *Proverbe 16:24*\n\nRevino des — te așteptăm cu gânduri bune.',
    },
    en: {
      title: 'Welcome to our blog',
      excerpt:
        'We have opened a space where we share thoughts from Scripture, news from the life of our Cluj community, and encouragement for every day.',
      author: 'Speranța Church, Cluj',
      content:
        "We're glad to have you here! This blog is where, from time to time, we will share:\n\n- **thoughts and encouragement** from the Bible;\n- **news from the life of our community** in Cluj;\n- **resources** for a life lived beautifully and with meaning.\n\n## Why a blog?\n\nBecause good stories and good words are worth sharing. We believe that every article can be a small window of hope for someone.\n\n> \"Gracious words are a honeycomb, sweet to the soul and healing to the bones.\" — *Proverbs 16:24*\n\nCome back often — we look forward to sharing with you.",
    },
  },
];

module.exports = async function seedArticles(strapi) {
  const uid = 'api::article.article';
  // Populăm o singură dată (rename-proof, ca la proiecte).
  if ((await strapi.db.query(uid).count()) > 0) return;
  const docs = strapi.documents(uid);
  const today = new Date().toISOString().slice(0, 10);

  for (const { ro, en, slug } of ARTICLES) {
    const exists = await strapi.db.query(uid).findOne({ where: { title: ro.title, locale: 'ro' } });
    if (exists) continue;

    // Strapi 5: EN e o limbă a aceluiași document, adăugată pe documentId-ul versiunii RO.
    const roEntry = await docs.create({ locale: 'ro', status: 'published', data: { ...ro, slug, date: today } });
    await docs.update({ documentId: roEntry.documentId, locale: 'en', data: { ...en, slug, author: en.author, date: today } });
    await docs.publish({ documentId: roEntry.documentId, locale: 'en' });
    strapi.log.info(`Seed: articol „${ro.title}" creat (ro + en, ${roEntry.documentId}).`);
  }
};
