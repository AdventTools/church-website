import type { MetadataRoute } from 'next';
import { getAllEvents, getAllProjects, getAllArticles, getAlbums, getVideos, getDevotionals, getDonation } from '@/lib/strapi';
import { getLatestVideos } from '@/lib/youtube';
import { todayInRomania } from '@/lib/solascriptura';
import { detailSeg } from '@/lib/utils';
import { site } from '@/config/site';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adventistcluj.ro';

export const revalidate = 3600;

const PATHS = ['', '/despre', '/ce-credem', '/prima-vizita', '/proiecte', '/blog', '/program', '/evenimente', '/contact'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = PATHS.flatMap((p) => {
    const roUrl = `${SITE_URL}${p}`;
    const enUrl = `${SITE_URL}/en${p}`;
    const languages = { ro: roUrl, en: enUrl };
    const priority = p === '' ? 1 : p === '/prima-vizita' ? 0.8 : 0.7;
    return [
      { url: roUrl, changeFrequency: 'weekly' as const, priority, alternates: { languages } },
      { url: enUrl, changeFrequency: 'weekly' as const, priority: priority * 0.9, alternates: { languages } },
    ];
  });

  const [roEvents, enEvents] = await Promise.all([getAllEvents('ro'), getAllEvents('en')]);
  const roUrl = (e: (typeof roEvents)[number]) => `${SITE_URL}/evenimente/${detailSeg(e)}`;
  const enUrl = (e: (typeof enEvents)[number]) => `${SITE_URL}/en/evenimente/${detailSeg(e)}`;

  const eventPages: MetadataRoute.Sitemap = [
    ...roEvents.map((e) => {
      const languages: Record<string, string> = { ro: roUrl(e) };
      if (e.alt?.locale === 'en') languages.en = `${SITE_URL}/en/evenimente/${detailSeg(e.alt)}`;
      return {
        url: roUrl(e),
        lastModified: e.startDate ? new Date(e.startDate) : undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        alternates: { languages },
      };
    }),
    ...enEvents.map((e) => {
      const languages: Record<string, string> = { en: enUrl(e) };
      if (e.alt?.locale === 'ro') languages.ro = `${SITE_URL}/evenimente/${detailSeg(e.alt)}`;
      return {
        url: enUrl(e),
        lastModified: e.startDate ? new Date(e.startDate) : undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.54,
        alternates: { languages },
      };
    }),
  ];

  const [roProjects, enProjects] = await Promise.all([getAllProjects('ro'), getAllProjects('en')]);
  const roPUrl = (p: (typeof roProjects)[number]) => `${SITE_URL}/proiecte/${detailSeg(p)}`;
  const enPUrl = (p: (typeof enProjects)[number]) => `${SITE_URL}/en/proiecte/${detailSeg(p)}`;

  const projectPages: MetadataRoute.Sitemap = [
    ...roProjects.map((p) => {
      const languages: Record<string, string> = { ro: roPUrl(p) };
      if (p.alt?.locale === 'en') languages.en = `${SITE_URL}/en/proiecte/${detailSeg(p.alt)}`;
      return { url: roPUrl(p), changeFrequency: 'monthly' as const, priority: 0.6, alternates: { languages } };
    }),
    ...enProjects.map((p) => {
      const languages: Record<string, string> = { en: enPUrl(p) };
      if (p.alt?.locale === 'ro') languages.ro = `${SITE_URL}/proiecte/${detailSeg(p.alt)}`;
      return { url: enPUrl(p), changeFrequency: 'monthly' as const, priority: 0.54, alternates: { languages } };
    }),
  ];

  const [roArticles, enArticles] = await Promise.all([getAllArticles('ro'), getAllArticles('en')]);
  const roAUrl = (a: (typeof roArticles)[number]) => `${SITE_URL}/blog/${detailSeg(a)}`;
  const enAUrl = (a: (typeof enArticles)[number]) => `${SITE_URL}/en/blog/${detailSeg(a)}`;

  const articlePages: MetadataRoute.Sitemap = [
    ...roArticles.map((a) => {
      const languages: Record<string, string> = { ro: roAUrl(a) };
      if (a.alt?.locale === 'en') languages.en = `${SITE_URL}/en/blog/${detailSeg(a.alt)}`;
      return {
        url: roAUrl(a),
        lastModified: a.date ? new Date(a.date) : undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        alternates: { languages },
      };
    }),
    ...enArticles.map((a) => {
      const languages: Record<string, string> = { en: enAUrl(a) };
      if (a.alt?.locale === 'ro') languages.ro = `${SITE_URL}/blog/${detailSeg(a.alt)}`;
      return {
        url: enAUrl(a),
        lastModified: a.date ? new Date(a.date) : undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.54,
        alternates: { languages },
      };
    }),
  ];

  // Paginile galeriei intră doar când au conținut; goale, ar fi soft-404 („încă nu e nimic").
  const [albums, videos, channel] = await Promise.all([getAlbums('ro'), getVideos('ro'), getLatestVideos(1)]);
  const latest = (dates: string[]) => {
    const d = dates.filter(Boolean).sort().pop();
    return d ? new Date(d) : undefined;
  };
  const galleryHubs: [string, boolean, Date | undefined][] = [
    ['/galerie', albums.length > 0 || videos.length > 0 || channel.length > 0, latest([...albums.map((a) => a.date), ...videos.map((v) => v.date)])],
    ['/galerie/foto', albums.length > 0, latest(albums.map((a) => a.date))],
    ['/galerie/video', videos.length > 0 || channel.length > 0, latest(videos.map((v) => v.date))],
  ];
  const galleryPages: MetadataRoute.Sitemap = galleryHubs
    .filter(([, has]) => has)
    .flatMap(([p, , lastModified]) => {
      const languages = { ro: `${SITE_URL}${p}`, en: `${SITE_URL}/en${p}` };
      return [
        { url: languages.ro, lastModified, changeFrequency: 'weekly' as const, priority: 0.6, alternates: { languages } },
        { url: languages.en, lastModified, changeFrequency: 'weekly' as const, priority: 0.54, alternates: { languages } },
      ];
    });
  // Slug-ul albumului e comun ambelor limbi, deci perechea RO↔EN are același segment.
  const albumPages: MetadataRoute.Sitemap = albums.flatMap((a) => {
    const languages = { ro: `${SITE_URL}/galerie/foto/${detailSeg(a)}`, en: `${SITE_URL}/en/galerie/foto/${detailSeg(a)}` };
    const images = a.photos.slice(0, 30).map((p) => `${SITE_URL}${p.large || p.small}`);
    return [
      { url: languages.ro, lastModified: new Date(a.date), changeFrequency: 'yearly' as const, priority: 0.5, alternates: { languages }, images },
      { url: languages.en, lastModified: new Date(a.date), changeFrequency: 'yearly' as const, priority: 0.45, alternates: { languages }, images },
    ];
  });

  // Gândul de dimineață: pagina-hub are conținut dacă există devoționale sau fluxul zilnic e pornit.
  const [roDevotionals, enDevotionals] = await Promise.all([getDevotionals('ro'), getDevotionals('en')]);
  const devotionalHub: MetadataRoute.Sitemap =
    roDevotionals.length > 0 || site.dailyThoughts
      ? [
          {
            url: `${SITE_URL}/gandul-de-dimineata`,
            // Cu fluxul pornit, pagina se schimbă în fiecare zi (gândul zilei, ora României).
            lastModified: site.dailyThoughts ? new Date(todayInRomania()) : undefined,
            changeFrequency: 'daily' as const, priority: 0.6, alternates: { languages: { ro: `${SITE_URL}/gandul-de-dimineata`, en: `${SITE_URL}/en/gandul-de-dimineata` } } },
          ...(roDevotionals.length || enDevotionals.length
            ? [{ url: `${SITE_URL}/en/gandul-de-dimineata`, changeFrequency: 'weekly' as const, priority: 0.5, alternates: { languages: { ro: `${SITE_URL}/gandul-de-dimineata`, en: `${SITE_URL}/en/gandul-de-dimineata` } } }]
            : []),
        ]
      : [];
  const devotionalPages: MetadataRoute.Sitemap = [
    ...roDevotionals.map((d) => {
      const languages: Record<string, string> = { ro: `${SITE_URL}/gandul-de-dimineata/${detailSeg(d)}` };
      if (d.alt?.locale === 'en') languages.en = `${SITE_URL}/en/gandul-de-dimineata/${detailSeg(d.alt)}`;
      return { url: languages.ro, lastModified: d.date ? new Date(d.date) : undefined, changeFrequency: 'yearly' as const, priority: 0.5, alternates: { languages } };
    }),
    ...enDevotionals
      .filter((d) => d.locale === 'en')
      .map((d) => {
        const languages: Record<string, string> = { en: `${SITE_URL}/en/gandul-de-dimineata/${detailSeg(d)}` };
        if (d.alt?.locale === 'ro') languages.ro = `${SITE_URL}/gandul-de-dimineata/${detailSeg(d.alt)}`;
        return { url: languages.en, lastModified: d.date ? new Date(d.date) : undefined, changeFrequency: 'yearly' as const, priority: 0.45, alternates: { languages } };
      }),
  ];

  // Donații: doar când IBAN-ul e completat (altfel pagina dă 404).
  const donationLanguages = { ro: `${SITE_URL}/donatii`, en: `${SITE_URL}/en/donatii` };
  const donationPages: MetadataRoute.Sitemap = (await getDonation('ro'))
    ? [
        { url: donationLanguages.ro, changeFrequency: 'yearly' as const, priority: 0.5, alternates: { languages: donationLanguages } },
        { url: donationLanguages.en, changeFrequency: 'yearly' as const, priority: 0.45, alternates: { languages: donationLanguages } },
      ]
    : [];

  return [...staticPages, ...eventPages, ...projectPages, ...articlePages, ...galleryPages, ...albumPages, ...devotionalHub, ...devotionalPages, ...donationPages];
}
