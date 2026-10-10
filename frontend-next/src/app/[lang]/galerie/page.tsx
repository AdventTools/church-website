import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Camera, Clapperboard } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import JsonLd from '@/components/JsonLd';
import { getAlbums, getBackgroundImages, getGalleryPage, getVideos } from '@/lib/strapi';
import { getLatestVideos } from '@/lib/youtube';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { albumHref, formatToLocalDate } from '@/lib/utils';
import { t, localePath, isLocale } from '@/lib/i18n';
import { BLUR } from '@/lib/blur';
import type { Locale } from '@/lib/types';
import styles from './galerie.module.scss';

export const revalidate = 60;

type Tile = { src: string; alt: string };

const MOSAIC = 3;

// Imaginea YouTube e 4:3 cu benzi negre; în dalele care nu sunt 16:9 se mărește cât să le taie.
const isYoutubeThumb = (src: string) => src.startsWith('https://i.ytimg.com/');

async function load(locale: Locale) {
  const [page, albums, videos, channel, bg] = await Promise.all([
    getGalleryPage(locale),
    getAlbums(locale),
    getVideos(locale),
    getLatestVideos(MOSAIC),
    getBackgroundImages(),
  ]);

  // Imaginile cardurilor le alege cine administrează; dacă nu a ales, vin copertele celor mai noi
  // albume, completate cu poze din ele cât să se umple mozaicul.
  const fallbackPhotos = [
    ...albums.map((a) => a.cover).filter((c): c is NonNullable<typeof c> => Boolean(c)),
    ...albums.flatMap((a) => a.photos),
  ].filter((img, i, all) => all.findIndex((o) => o.id === img.id) === i);
  const photoTiles: Tile[] = (page.photoCardImages.length ? page.photoCardImages : fallbackPhotos)
    .slice(0, MOSAIC)
    .map((i) => ({ src: i.large || i.small, alt: i.alt }));
  // Filmele alese în CMS au prioritate; fără ele, cardul Video arată transmisiunile de pe canal.
  const videoTiles: Tile[] = (
    page.videoCardImages.length
      ? page.videoCardImages.map((i) => ({ src: i.large || i.small, alt: i.alt }))
      : videos.length
        ? videos.map((v) => ({ src: v.thumbnail, alt: v.title }))
        : channel.map((v) => ({ src: v.thumb, alt: v.title }))
  ).slice(0, MOSAIC);

  return { page, albums, videos, channel, bg, photoTiles, videoTiles };
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const g = t(locale).gallery;
  const { albums, videos, channel, photoTiles } = await load(locale);
  return pageMetadata({
    locale,
    title: `${g.title} — ${g.subtitle}`,
    description: g.meta,
    path: '/galerie',
    image: photoTiles[0]?.src,
    noindex: albums.length === 0 && videos.length === 0 && channel.length === 0,
  });
}

function Mosaic({ tiles, video }: { tiles: Tile[]; video?: boolean }) {
  return (
    <div className={styles.mosaic} data-count={tiles.length}>
      {tiles.map((tile, i) => (
        <div key={`${tile.src}-${i}`} className={`${styles.tile} ${isYoutubeThumb(tile.src) ? styles.ytCrop : ''}`}>
          <Image
            src={tile.src}
            alt={i === 0 ? tile.alt : ''}
            fill
            sizes={i === 0 ? '(max-width: 760px) 66vw, 380px' : '(max-width: 760px) 33vw, 190px'}
            placeholder="blur"
            blurDataURL={BLUR}
          />
          {video && i === 0 && (
            <span className={styles.play} aria-hidden>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
              </svg>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function GaleriePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const g = dict.gallery;
  const { page, albums, videos, channel, bg, photoTiles, videoTiles } = await load(locale);
  const photoCount = albums.reduce((n, a) => n + a.photos.length, 0);
  const hasVideo = videos.length > 0 || channel.length > 0;

  const recent = [
    ...albums.map((a) => ({
      key: `a${a.id}`,
      kind: 'album' as const,
      date: a.date,
      href: albumHref(a, locale),
      title: a.title,
      img: a.cover ? a.cover.large || a.cover.small : '',
      meta: g.count.photos(a.photos.length),
    })),
    ...videos.map((v) => ({
      key: `v${v.id}`,
      kind: 'video' as const,
      date: v.date,
      href: `${localePath(locale, '/galerie/video')}#film-${v.id}`,
      title: v.title,
      img: v.thumbnail,
      meta: formatToLocalDate(v.date, locale),
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 4);

  const empty = albums.length === 0 && !hasVideo;

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            type: 'CollectionPage',
            name: g.title,
            path: localePath(locale, '/galerie'),
            description: g.meta,
            locale,
            image: photoTiles[0]?.src,
            speakable: true,
          }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: g.title, path: localePath(locale, '/galerie') },
          ]),
        ]}
      />
      <PageHeader title={g.title} image={photoTiles[0]?.src || bg.home} />

      <Section>
        <div className={styles.lead}>
          <p className={styles.eyebrow}>{g.subtitle}</p>
          <p className={`${styles.intro} speakable`}>{page.intro || g.intro}</p>
        </div>

        {empty ? (
          <p className={styles.empty}>{g.empty}</p>
        ) : (
          <div className={styles.doors} data-single={albums.length === 0 || !hasVideo ? '' : undefined}>
            {albums.length > 0 && (
              <Link href={localePath(locale, '/galerie/foto')} className={`${styles.door} ${styles.photo}`}>
                <Mosaic tiles={photoTiles} />
                <div className={styles.doorText}>
                  <h2 className={styles.doorTitle}>
                    <span className={styles.icon} aria-hidden>
                      <Camera size={22} />
                    </span>
                    {g.photos}
                  </h2>
                  <p className={styles.doorMeta}>
                    {g.count.albums(albums.length)} · {g.count.photos(photoCount)}
                  </p>
                  <span className={`btn ${styles.doorCta}`}>
                    {g.photosCta} <ArrowRight size={18} aria-hidden />
                  </span>
                </div>
              </Link>
            )}
            {hasVideo && (
              <Link href={localePath(locale, '/galerie/video')} className={`${styles.door} ${styles.video}`}>
                <Mosaic tiles={videoTiles} video />
                <div className={styles.doorText}>
                  <h2 className={styles.doorTitle}>
                    <span className={styles.icon} aria-hidden>
                      <Clapperboard size={22} />
                    </span>
                    {g.videos}
                  </h2>
                  <p className={styles.doorMeta}>
                    {videos.length > 0 ? `${g.count.videos(videos.length)} · ${g.newest} ${videos[0].title}` : g.channel}
                  </p>
                  <span className={`btn ${styles.doorCta}`}>
                    {g.videosCta} <ArrowRight size={18} aria-hidden />
                  </span>
                </div>
              </Link>
            )}
          </div>
        )}
      </Section>

      {recent.length > 1 && (
        <Section title={g.recent} className="section--surface">
          <ul className={styles.recent}>
            {recent.map((r) => (
              <li key={r.key}>
                <Link href={r.href} className={styles.recentCard}>
                  <span className={`${styles.recentThumb} ${isYoutubeThumb(r.img) ? styles.ytCrop : ''}`}>
                    {r.img && (
                      <Image
                        src={r.img}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 70vw, (max-width: 1000px) 33vw, 270px"
                        placeholder="blur"
                        blurDataURL={BLUR}
                      />
                    )}
                    <span className={`${styles.badge} ${r.kind === 'video' ? styles.badgeVideo : ''}`}>
                      {r.kind === 'video' ? g.video : g.album}
                    </span>
                  </span>
                  <h3 className={styles.recentTitle}>{r.title}</h3>
                  <span className={styles.recentMeta}>{r.meta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
