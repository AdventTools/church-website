import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import Gallery from '@/components/Gallery';
import JsonLd from '@/components/JsonLd';
import { getHistory, getGallery, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './despre.module.scss';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  return pageMetadata({ locale, title: dict.about.title, description: dict.about.meta, path: '/despre' });
}

export default async function DesprePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);

  const [history, gallery, bg] = await Promise.all([getHistory(locale), getGallery(locale), getBackgroundImages()]);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'AboutPage', name: dict.about.title, path: localePath(locale, '/despre'), description: dict.about.meta, locale }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.about.title, path: localePath(locale, '/despre') },
          ]),
        ]}
      />
      <PageHeader title={dict.about.title} image={bg.home} />

      {history.length > 0 && (
        <Section title={dict.about.history}>
          <div className={styles.timeline}>
            {history.map((h) => (
              <article key={h.id} className={styles.entry}>
                <h3 className={styles.period}>{h.period}</h3>
                <p className={styles.desc}>{h.description}</p>
              </article>
            ))}
          </div>
        </Section>
      )}

      {gallery.images.length > 0 && (
        <Section title={dict.about.gallery} className="section--surface">
          {gallery.description && <p className={styles.galleryDesc}>{gallery.description}</p>}
          <Gallery images={gallery.images} locale={locale} />
        </Section>
      )}
    </>
  );
}
