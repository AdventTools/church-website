import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import ShuffledProjects from '@/components/ShuffledProjects';
import JsonLd from '@/components/JsonLd';
import { getProjects, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata, absoluteUrl } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import { detailSeg } from '@/lib/utils';
import type { Locale } from '@/lib/types';
import styles from './proiecte.module.scss';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  return pageMetadata({ locale, title: dict.projects.title, description: dict.projects.meta, path: '/proiecte' });
}

export default async function ProiectePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);

  const [projects, bg] = await Promise.all([getProjects(locale), getBackgroundImages()]);

  const itemList = projects.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: projects.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.title,
          url: absoluteUrl(localePath(locale, `/proiecte/${detailSeg(p)}`)),
        })),
      }
    : null;

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'CollectionPage', name: dict.projects.title, path: localePath(locale, '/proiecte'), description: dict.projects.meta, locale }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.projects.title, path: localePath(locale, '/proiecte') },
          ]),
          ...(itemList ? [itemList] : []),
        ]}
      />
      <PageHeader title={dict.projects.title} image={bg.home} />

      <Section>
        {projects.length > 0 ? (
          <>
            <p className={styles.intro}>{dict.projects.intro}</p>
            <ShuffledProjects projects={projects} locale={locale} />
          </>
        ) : (
          <p>{locale === 'en' ? 'Projects will be available soon.' : 'Proiectele vor fi disponibile în curând.'}</p>
        )}
      </Section>
    </>
  );
}
