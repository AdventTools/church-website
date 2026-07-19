import type { MetadataRoute } from 'next';
import { getAllEvents, getAllProjects, getAllArticles } from '@/lib/strapi';
import { detailSeg } from '@/lib/utils';

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

  return [...staticPages, ...eventPages, ...projectPages, ...articlePages];
}
