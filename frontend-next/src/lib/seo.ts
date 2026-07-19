import type { Metadata } from 'next';
import type { Locale } from './types';
import { localePath, OG_LOCALE } from './i18n';
import { site, siteName as siteNameCfg } from '@/config/site';

// Valorile concrete stau în config/site.ts (fișierul unic de rebrand). Aici doar re-export.
export const SITE_URL = site.url;
export const SITE_NAME = site.name.ro;
export const SITE_NAME_EN = site.name.en;
export const siteName = (locale: Locale): string => siteNameCfg(locale);
export const DEFAULT_DESCRIPTION = site.description.ro;
export const GEO = site.geo;
export const STREET = site.address.street;
export const LOCALITY = site.address.locality;

export function absoluteUrl(path = ''): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
}

type PageMetaInput = {
  locale?: Locale;
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  // Override hreflang (ex. pagini de eveniment unde perechea RO↔EN are id/slug diferite).
  languages?: Record<string, string>;
};

// Metadata coerentă pe pagină: canonical + hreflang (ro/en/x-default) + Open Graph + Twitter.
export function pageMetadata({
  locale = 'ro',
  title,
  description,
  path = '',
  image,
  type = 'website',
  noindex,
  languages: languagesOverride,
}: PageMetaInput): Metadata {
  const canonical = absoluteUrl(localePath(locale, path));
  const languages = languagesOverride ?? {
    ro: absoluteUrl(path || '/'),
    en: absoluteUrl(localePath('en', path)),
    'x-default': absoluteUrl(path || '/'),
  };
  const img = absoluteUrl(image || '/icon.png');
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      type,
      siteName: siteName(locale),
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === 'en' ? 'ro' : 'en'],
      images: [{ url: img }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [img] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
