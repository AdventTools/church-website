import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import JsonLd from '@/components/JsonLd';
import { BLUR } from '@/lib/blur';
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
        <Section
          title={dict.about.gallery}
          className="section--surface"
          cta={{ href: localePath(locale, '/galerie'), label: dict.gallery.seeGallery }}
        >
          {gallery.description && <p className={styles.galleryDesc}>{gallery.description}</p>}
          <div className={styles.teaser}>
            {gallery.images.slice(0, 4).map((img) => (
              <Link key={img.id} href={localePath(locale, '/galerie')} className={styles.teaserTile} tabIndex={-1} aria-hidden>
                <Image src={img.large || img.small} alt="" fill sizes="(max-width: 640px) 46vw, 280px" placeholder="blur" blurDataURL={BLUR} />
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
