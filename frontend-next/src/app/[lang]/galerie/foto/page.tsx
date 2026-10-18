import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import AlbumCard from '@/components/AlbumCard';
import Gallery from '@/components/Gallery';
import JsonLd from '@/components/JsonLd';
import { getAlbums, getBackgroundImages, getGallery } from '@/lib/strapi';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { groupByTopic } from '@/lib/utils';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './foto.module.scss';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const g = t(locale).gallery;
  const [albums, legacy] = await Promise.all([getAlbums(locale), getGallery(locale)]);
  const cover = albums[0]?.cover ?? legacy.images[0];
  return pageMetadata({
    locale,
    title: `${g.photos} — ${g.title}`,
    description: g.photosMeta,
    path: '/galerie/foto',
    image: cover ? cover.large || cover.small : undefined,
    noindex: albums.length === 0 && legacy.images.length === 0,
  });
}

export default async function FotoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const g = dict.gallery;
  const [albums, legacy, bg] = await Promise.all([getAlbums(locale), getGallery(locale), getBackgroundImages()]);
  const groups = groupByTopic(albums, locale);
  const titled = groups.length > 1 || Boolean(groups[0]?.name);
  // Fără niciun album, pozele din galeria de dinainte de albume rămân vizibile aici.
  const loose = albums.length === 0 ? legacy.images : [];
  const cover = albums[0]?.cover ?? loose[0];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'CollectionPage', name: g.photos, path: localePath(locale, '/galerie/foto'), description: g.photosMeta, locale }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: g.title, path: localePath(locale, '/galerie') },
            { name: g.photos, path: localePath(locale, '/galerie/foto') },
          ]),
        ]}
      />
      <PageHeader title={g.photos} image={cover ? cover.large || cover.small : bg.home} />

      <Section>
        <p className={styles.intro}>{g.photosIntro}</p>

        {albums.length === 0 && loose.length === 0 && <p className={styles.intro}>{g.empty}</p>}
        {loose.length > 0 && <Gallery images={loose} locale={locale} layout="justified" />}

        {groups.length > 1 && (
          <nav className={styles.topics} aria-label={g.topicsNav}>
            {groups.map((gr) => (
              <a key={gr.slug} href={`#${gr.slug}`} className={styles.chip}>
                {gr.name ?? g.otherAlbums}
                <span className={styles.chipCount}>{gr.items.length}</span>
              </a>
            ))}
          </nav>
        )}

        {groups.map((gr) => (
          <section key={gr.slug} id={gr.slug} className={styles.group} aria-labelledby={titled ? `t-${gr.slug}` : undefined}>
            {titled && (
              <h2 id={`t-${gr.slug}`} className={styles.groupTitle}>
                {gr.name ?? g.otherAlbums}
              </h2>
            )}
            <div className={styles.albums}>
              {gr.items.map((a) => (
                <AlbumCard key={a.id} album={a} locale={locale} headingLevel={titled ? 3 : 2} />
              ))}
            </div>
          </section>
        ))}
      </Section>
    </>
  );
}
