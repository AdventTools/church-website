import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import VideoPlayer from '@/components/VideoPlayer';
import Sermons from '@/components/Sermons';
import JsonLd from '@/components/JsonLd';
import { getBackgroundImages, getVideos } from '@/lib/strapi';
import { getLatestVideos, channelUrl } from '@/lib/youtube';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, videoJsonLd, videoListJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { formatToLocalDate, groupByTopic } from '@/lib/utils';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { GalleryVideo, Locale } from '@/lib/types';
import styles from './video.module.scss';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const g = t(locale).gallery;
  const [videos, channel] = await Promise.all([getVideos(locale), getLatestVideos(6)]);
  return pageMetadata({
    locale,
    title: `${g.videos} — ${g.title}`,
    description: g.videosMeta,
    path: '/galerie/video',
    image: videos[0]?.thumbnail ?? channel[0]?.thumb,
    noindex: videos.length === 0 && channel.length === 0,
  });
}

function VideoCard({ v, locale }: { v: GalleryVideo; locale: Locale }) {
  return (
    <article id={`film-${v.id}`} className={styles.card}>
      <VideoPlayer
        youtubeId={v.youtubeId}
        title={v.title}
        thumbnail={v.thumbnail}
        locale={locale}
        sizes="(max-width: 640px) 92vw, (max-width: 1000px) 46vw, 360px"
      />
      <h3 className={styles.cardTitle}>{v.title}</h3>
      <p className={styles.cardMeta}>
        <time dateTime={v.date}>{formatToLocalDate(v.date, locale)}</time>
      </p>
      {v.description && <p className={styles.cardDesc}>{v.description}</p>}
    </article>
  );
}

export default async function VideoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const g = dict.gallery;
  const [videos, channel, bg] = await Promise.all([getVideos(locale), getLatestVideos(6), getBackgroundImages()]);
  // Recomandatul: cel mai nou dintre cele bifate, altfel cel mai nou film.
  const featured = videos.find((v) => v.featured) ?? videos[0];
  const rest = videos.filter((v) => v !== featured);
  const groups = groupByTopic(rest, locale);
  const titled = groups.length > 1 || Boolean(groups[0]?.name);
  const channelLink = channelUrl();

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'CollectionPage', name: g.videos, path: localePath(locale, '/galerie/video'), description: g.videosMeta, locale }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: g.title, path: localePath(locale, '/galerie') },
            { name: g.videos, path: localePath(locale, '/galerie/video') },
          ]),
          ...videos.map((v) => videoJsonLd(v, locale)),
          ...(channel.length ? [videoListJsonLd(channel)] : []),
        ]}
      />
      <PageHeader title={g.videos} image={bg.home} />

      {featured && (
        <Section>
          <p className={styles.intro}>{g.videosIntro}</p>
          <article id={`film-${featured.id}`} className={styles.featured}>
            <VideoPlayer
              youtubeId={featured.youtubeId}
              title={featured.title}
              thumbnail={featured.thumbnail}
              locale={locale}
              sizes="(max-width: 900px) 92vw, 720px"
              priority
            />
            <div className={styles.featuredInfo}>
              <p className={styles.kicker}>{g.featured}</p>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              {featured.description && <p className={styles.featuredDesc}>{featured.description}</p>}
              <p className={styles.cardMeta}>
                <time dateTime={featured.date}>{formatToLocalDate(featured.date, locale)}</time>
                {featured.topic && <> · {featured.topic.name}</>}
              </p>
            </div>
          </article>
        </Section>
      )}

      {rest.length > 0 && (
        <Section className="section--surface">
          {groups.map((gr) => (
            <section key={gr.slug} className={styles.group} aria-labelledby={`v-${gr.slug}`}>
              <h2 id={`v-${gr.slug}`} className={styles.groupTitle}>
                {titled ? (gr.name ?? g.otherVideos) : g.allVideos}
              </h2>
              <div className={styles.grid}>
                {gr.items.map((v) => (
                  <VideoCard key={v.id} v={v} locale={locale} />
                ))}
              </div>
            </section>
          ))}
        </Section>
      )}

      {channel.length > 0 && (
        <Section title={g.channel} id="canal" cta={channelLink ? { href: channelLink, label: g.channelCta } : undefined}>
          <Sermons videos={channel} locale={locale} />
        </Section>
      )}

      {!featured && channel.length === 0 && (
        <Section>
          <p className={styles.intro}>{g.empty}</p>
        </Section>
      )}
    </>
  );
}
