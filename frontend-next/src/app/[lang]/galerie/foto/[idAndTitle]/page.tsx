import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, Images } from 'lucide-react';
import Gallery from '@/components/Gallery';
import JsonLd from '@/components/JsonLd';
import { getAlbumByOldSlug, getAlbumBySlug, getAlbums } from '@/lib/strapi';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, imageGalleryJsonLd } from '@/lib/jsonld';
import { albumHref, detailSeg, eventHref, formatToLocalDate, legacyId, summarize } from '@/lib/utils';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale, PhotoAlbum } from '@/lib/types';
import styles from './album.module.scss';

export const revalidate = 60;

// Slug curent → pagina; slug vechi sau forma „{id}-{titlu}" → redirect 301 către cel curent.
async function resolveAlbum(seg: string, locale: Locale): Promise<{ album: PhotoAlbum | null; redirectTo: string | null }> {
  const bySlug = await getAlbumBySlug(seg, locale);
  if (bySlug) return { album: bySlug, redirectTo: null };

  const byOld = await getAlbumByOldSlug(seg, locale);
  if (byOld) return { album: byOld, redirectTo: detailSeg(byOld) === seg ? null : albumHref(byOld, locale) };

  const id = legacyId(seg);
  if (id) {
    const byId = (await getAlbums(locale)).find((a) => String(a.id) === id);
    if (byId) return { album: byId, redirectTo: detailSeg(byId) === seg ? null : albumHref(byId, locale) };
  }
  return { album: null, redirectTo: null };
}

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const locale: Locale = isLocale(params.lang) ? params.lang : 'ro';
  return (await getAlbums(locale)).map((a) => ({ idAndTitle: detailSeg(a) }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; idAndTitle: string }> }): Promise<Metadata> {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const g = t(locale).gallery;
  const { album } = await resolveAlbum(idAndTitle, locale);
  if (!album) return { title: g.photos, robots: { index: false, follow: false } };

  const fallback = g.albumMeta(album.title, g.count.photos(album.photos.length), formatToLocalDate(album.date, locale));
  return pageMetadata({
    locale,
    title: `${album.title} — ${g.photos}`,
    description: summarize(album.description || fallback, 160),
    path: `/galerie/foto/${detailSeg(album)}`,
    image: album.cover ? album.cover.large || album.cover.small : undefined,
  });
}

export default async function AlbumPage({ params }: { params: Promise<{ lang: string; idAndTitle: string }> }) {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const g = dict.gallery;
  const { album, redirectTo } = await resolveAlbum(idAndTitle, locale);
  if (!album) notFound();
  if (redirectTo) permanentRedirect(redirectTo);

  const path = albumHref(album, locale);

  return (
    <>
      <JsonLd
        data={[
          imageGalleryJsonLd(album, path, locale),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: g.title, path: localePath(locale, '/galerie') },
            { name: g.photos, path: localePath(locale, '/galerie/foto') },
            { name: album.title, path },
          ]),
        ]}
      />

      <header className={styles.head}>
        <div className="container">
          <Link href={localePath(locale, '/galerie/foto')} className={styles.back}>
            <ArrowLeft size={18} aria-hidden /> {g.back}
          </Link>
          {album.topic && <p className={styles.topic}>{album.topic.name}</p>}
          <h1 className={styles.title}>{album.title}</h1>
          <p className={styles.meta}>
            <span>
              <CalendarDays size={17} aria-hidden />
              <time dateTime={album.date}>{formatToLocalDate(album.date, locale)}</time>
            </span>
            <span>
              <Images size={17} aria-hidden />
              {g.count.photos(album.photos.length)}
            </span>
            {album.event && (
              <Link href={eventHref(album.event, locale)} className={styles.event}>
                {g.seeEvent} →
              </Link>
            )}
          </p>
          {album.description && <p className={`${styles.desc} speakable`}>{album.description}</p>}
        </div>
      </header>

      <section className={styles.photos} aria-label={g.photos}>
        <div className="container">
          <Gallery images={album.photos} locale={locale} layout="justified" />
        </div>
      </section>
    </>
  );
}
