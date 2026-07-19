import type { ChurchInfo, Contact, Program, ChurchEvent } from './types';
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, GEO, STREET, LOCALITY, absoluteUrl } from './seo';
import { site, siteSlogan } from '@/config/site';

const clean = (s: string) => (s || '').replace(/\s+/g, ' ').trim();

const DAY_SCHEMA: Record<string, string> = {
  Duminica: 'https://schema.org/Sunday',
  Luni: 'https://schema.org/Monday',
  Marti: 'https://schema.org/Tuesday',
  Miercuri: 'https://schema.org/Wednesday',
  Joi: 'https://schema.org/Thursday',
  Vineri: 'https://schema.org/Friday',
  Sambata: 'https://schema.org/Saturday',
};

const POSTAL = {
  '@type': 'PostalAddress',
  streetAddress: STREET,
  addressLocality: LOCALITY,
  addressRegion: site.address.region,
  postalCode: site.address.postalCode,
  addressCountry: site.address.country,
};

export function churchJsonLd(info: ChurchInfo | null, contact: Contact | null, programs: Program[] = [], locale: 'ro' | 'en' = 'ro') {
  const openingHours = programs
    .filter((p) => DAY_SCHEMA[p.day] && p.time)
    .map((p) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_SCHEMA[p.day],
      opens: p.time,
      name: p.name,
    }));

  const sameAs = [info?.facebookLink, info?.youtubeLink, info?.instagramLink].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Church',
    '@id': `${SITE_URL}/#church`,
    additionalType: 'https://schema.org/PlaceOfWorship',
    name: info?.churchName || SITE_NAME,
    alternateName: site.alternateNames,
    url: SITE_URL,
    description: info?.description || DEFAULT_DESCRIPTION,
    slogan: siteSlogan(locale),
    logo: absoluteUrl(info?.nameLogoUrl || '/icon.png'),
    image: absoluteUrl('/icon.png'),
    address: POSTAL,
    geo: { '@type': 'GeoCoordinates', latitude: GEO.lat, longitude: GEO.lng },
    hasMap: info?.locationMapLink || undefined,
    ...(contact?.phone ? { telephone: contact.phone } : {}),
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.phone || contact?.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'general',
            ...(contact?.phone ? { telephone: contact.phone } : {}),
            ...(contact?.email ? { email: contact.email } : {}),
            availableLanguage: ['ro', 'en'],
          },
        }
      : {}),
    ...(contact?.pastor ? { employee: { '@type': 'Person', name: contact.pastor, jobTitle: 'Pastor' } } : {}),
    knowsLanguage: ['ro', 'en'],
    areaServed: { '@type': 'City', name: site.areaServed },
    foundingDate: site.foundingYear,
    isAccessibleForFree: true,
    publicAccess: true,
    keywords: site.keywords,
    parentOrganization: {
      '@type': 'Organization',
      name: site.parentOrganization.name,
      url: site.parentOrganization.url,
    },
    ...(openingHours.length ? { openingHoursSpecification: openingHours } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(locale: 'ro' | 'en' = 'ro') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: locale === 'en' ? 'en-GB' : 'ro-RO',
    publisher: { '@id': `${SITE_URL}/#church` },
  };
}

// Tipizează pagina pentru motoare/AI: WebPage/AboutPage/ContactPage/CollectionPage, legată de site + entitatea Church.
export function webPageJsonLd(opts: {
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
  name: string;
  path: string;
  description?: string;
  locale?: 'ro' | 'en';
  image?: string;
  speakable?: boolean;
}) {
  const { type = 'WebPage', name, path, description, locale = 'ro', image, speakable } = opts;
  const url = absoluteUrl(path);
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    ...(description ? { description } : {}),
    inLanguage: locale === 'en' ? 'en-GB' : 'ro-RO',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#church` },
    ...(image ? { primaryImageOfPage: absoluteUrl(image) } : {}),
    ...(speakable
      ? { speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', 'h2', '.speakable'] } }
      : {}),
  };
}

// Serviciile săptămânale ca Event-uri recurente — răspuns clar la „când se întâlnește biserica?" pentru AI/Google.
export function recurringServicesJsonLd(programs: Program[], locale: 'ro' | 'en' = 'ro') {
  const items = programs
    .filter((p) => DAY_SCHEMA[p.day] && p.time)
    .map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Event',
        name: p.name,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        eventSchedule: {
          '@type': 'Schedule',
          repeatFrequency: 'P1W',
          byDay: DAY_SCHEMA[p.day],
          startTime: p.time,
        },
        location: { '@id': `${SITE_URL}/#church` },
        organizer: { '@id': `${SITE_URL}/#church` },
        isAccessibleForFree: true,
        inLanguage: locale === 'en' ? 'en-GB' : 'ro-RO',
      },
    }));
  return { '@context': 'https://schema.org', '@type': 'ItemList', name: locale === 'en' ? 'Weekly services' : 'Programul săptămânal', itemListElement: items };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqJsonLd(qa: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  };
}

export function eventJsonLd(event: ChurchEvent) {
  const cover = event.largeImg || event.smallImg;
  // Locația reală a evenimentului (ex. o sală externă); dacă lipsește, e la biserică.
  const place = event.locationName
    ? {
        '@type': 'Place',
        name: event.locationName,
        ...(event.locationAddress
          ? { address: { '@type': 'PostalAddress', streetAddress: event.locationAddress, addressLocality: LOCALITY, addressCountry: 'RO' } }
          : {}),
        ...(event.locationMapLink ? { hasMap: event.locationMapLink } : {}),
      }
    : { '@type': 'Place', name: SITE_NAME, address: POSTAL };
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: clean(event.intro || event.content).slice(0, 500),
    ...(cover ? { image: [absoluteUrl(cover)] } : {}),
    location: place,
    organizer: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

export function videoListJsonLd(videos: { id: string; title: string; published: string; thumb: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: videos.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: v.title,
        description: v.title,
        thumbnailUrl: v.thumb,
        uploadDate: v.published,
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
        contentUrl: v.url,
      },
    })),
  };
}
