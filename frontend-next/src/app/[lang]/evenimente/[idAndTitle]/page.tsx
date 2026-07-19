import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { FacebookIcon } from '@/components/BrandIcons';
import JsonLd from '@/components/JsonLd';
import { getEventBySlug, getEventByOldSlug, getEvent, getAllEvents } from '@/lib/strapi';
import { getFormattedPeriod, detailSeg, legacyId } from '@/lib/utils';
import { pageMetadata, absoluteUrl } from '@/lib/seo';
import { eventJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import { BLUR } from '@/lib/blur';
import type { ChurchEvent, Locale } from '@/lib/types';
import styles from './event.module.scss';

export const revalidate = 60;

async function resolveEvent(seg: string, locale: Locale): Promise<{ event: ChurchEvent | null; redirectTo: string | null }> {
  const bySlug = await getEventBySlug(seg, locale);
  if (bySlug) return { event: bySlug, redirectTo: null };
  const byOld = await getEventByOldSlug(seg, locale);
  if (byOld?.slug) return { event: byOld, redirectTo: `/evenimente/${byOld.slug}` };
  const id = legacyId(seg);
  if (id) {
    const byId = await getEvent(id);
    if (byId) return { event: byId, redirectTo: byId.slug ? `/evenimente/${byId.slug}` : null };
  }
  return { event: null, redirectTo: null };
}

// hreflang: slug-ul e partajat RO↔EN, deci același segment în ambele limbi.
function eventLanguages(event: ChurchEvent, locale: Locale): Record<string, string> {
  const seg = detailSeg(event);
  const self = event.locale ?? locale;
  const urls: Record<string, string> = { [self]: absoluteUrl(localePath(self, `/evenimente/${seg}`)) };
  if (event.alt) urls[event.alt.locale] = absoluteUrl(localePath(event.alt.locale, `/evenimente/${event.alt.slug || seg}`));
  return { ...urls, 'x-default': urls.ro ?? urls[self] };
}

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const locale: Locale = isLocale(params.lang) ? params.lang : 'ro';
  const events = await getAllEvents(locale);
  return events.map((e) => ({ idAndTitle: detailSeg(e) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; idAndTitle: string }>;
}): Promise<Metadata> {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const { event } = await resolveEvent(idAndTitle, locale);
  if (!event) {
    return { title: locale === 'en' ? 'Event' : 'Eveniment', robots: { index: false, follow: false } };
  }

  const description = (event.intro || event.content || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  return pageMetadata({
    locale,
    title: event.title,
    description,
    path: `/evenimente/${detailSeg(event)}`,
    image: event.largeImg || event.smallImg,
    type: 'article',
    languages: eventLanguages(event, locale),
  });
}

export default async function EventDetail({ params }: { params: Promise<{ lang: string; idAndTitle: string }> }) {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const { event, redirectTo } = await resolveEvent(idAndTitle, locale);
  if (!event) notFound();
  if (redirectTo) permanentRedirect(localePath(locale, redirectTo));

  const seg = detailSeg(event);
  const cover = event.largeImg || event.smallImg;
  const backText = locale === 'en' ? 'Back to events' : 'Înapoi la evenimente';
  const fbText = locale === 'en' ? "See the event's Facebook page" : 'Vezi pagina de Facebook a evenimentului';

  return (
    <>
      <JsonLd
        data={[
          eventJsonLd(event),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.events.title, path: localePath(locale, '/evenimente') },
            { name: event.title, path: localePath(locale, `/evenimente/${seg}`) },
          ]),
        ]}
      />

      <header className={styles.head}>
        <div className="container">
          <Link href={localePath(locale, '/evenimente')} className={styles.back}>
            <ArrowLeft size={18} /> {backText}
          </Link>
          <h1 className={styles.title}>{event.title}</h1>
          <div className={styles.meta}>
            <span>{getFormattedPeriod(event.startDate, event.endDate, locale)}</span>
          </div>
          {event.locationName && (
            <p className={styles.location}>
              <MapPin size={16} aria-hidden />
              {event.locationMapLink ? (
                <a href={event.locationMapLink} target="_blank" rel="noopener noreferrer">
                  {event.locationName}
                  {event.locationAddress ? ` · ${event.locationAddress}` : ''}
                </a>
              ) : (
                <span>
                  {event.locationName}
                  {event.locationAddress ? ` · ${event.locationAddress}` : ''}
                </span>
              )}
            </p>
          )}
        </div>
      </header>

      {cover && (
        <div className={styles.coverWrap}>
          <div className="container">
            <Image
              className={styles.cover}
              src={cover}
              alt={event.title}
              width={event.imgWidth ?? 1200}
              height={event.imgHeight ?? 800}
              sizes="(max-width: 760px) 100vw, 760px"
              placeholder="blur"
              blurDataURL={BLUR}
              priority
            />
          </div>
        </div>
      )}

      <article className={`container ${styles.article}`}>
        {event.intro && <p className={styles.intro}>{event.intro}</p>}
        {event.content && <div className={styles.content}>{event.content}</div>}
        {event.facebookLink && (
          <a href={event.facebookLink} target="_blank" rel="noopener noreferrer" className={styles.fb}>
            <FacebookIcon size={18} /> {fbText}
          </a>
        )}
      </article>
    </>
  );
}
