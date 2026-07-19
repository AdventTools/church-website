import type { Metadata, Viewport } from 'next';
import type { ReactNode, CSSProperties } from 'react';
import { Source_Sans_3 } from 'next/font/google';
import { notFound } from 'next/navigation';
import './globals.scss';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnalyticsConsent from '@/components/AnalyticsConsent';
import JsonLd from '@/components/JsonLd';
import { getChurchInfo, getStyle, getUnderConstruction, getContact, getPrograms } from '@/lib/strapi';
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, absoluteUrl } from '@/lib/seo';
import { churchJsonLd, websiteJsonLd } from '@/lib/jsonld';
import { site } from '@/config/site';
import { t, HTML_LANG, OG_LOCALE, isLocale, localePath, INTL_TAG } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

const font = Source_Sans_3({ subsets: ['latin', 'latin-ext'], display: 'swap', variable: '--font-body' });

const FALLBACK_STYLE = {
  primaryColor: site.colors.primary,
  secondPrimaryColor: site.colors.secondPrimary,
  accentColor: site.colors.accent,
  secondAccentColor: site.colors.secondAccent,
};

export function generateStaticParams() {
  return [{ lang: 'ro' }, { lang: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const [info, underConstruction] = await Promise.all([getChurchInfo(locale), getUnderConstruction()]);
  const title = info?.tabTitle || info?.churchName || SITE_NAME;
  const description = info?.description || DEFAULT_DESCRIPTION;
  const ogImage = absoluteUrl('/icon.png');
  const home = localePath(locale, '/');
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${title}` },
    description,
    alternates: {
      canonical: absoluteUrl(home),
      languages: { ro: `${SITE_URL}/`, en: `${SITE_URL}/en`, 'x-default': `${SITE_URL}/` },
    },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === 'en' ? 'ro' : 'en'],
      siteName: title,
      url: absoluteUrl(home),
      title,
      description,
      images: [{ url: ogImage }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: { title: site.shortName, capable: true, statusBarStyle: 'default' },
    robots: underConstruction ? { index: false, follow: false } : undefined,
  };
}

export const viewport: Viewport = { themeColor: site.colors.primary };

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = t(locale);

  const [churchInfo, style, underConstruction, contact, programs] = await Promise.all([
    getChurchInfo(locale),
    getStyle(),
    getUnderConstruction(),
    getContact(locale),
    getPrograms(locale),
  ]);

  // Următorul program din orar: cea mai apropiată zi+oră față de acum (se recalculează la revalidare).
  const DAY_NUM: Record<string, number> = {
    Duminica: 0,
    Luni: 1,
    Marti: 2,
    Miercuri: 3,
    Joi: 4,
    Vineri: 5,
    Sambata: 6,
  };
  const now = new Date();
  let next: { date: Date; name: string; time: string } | null = null;
  for (const p of programs) {
    const dn = DAY_NUM[p.day];
    if (dn === undefined || !/^\d{1,2}:\d{2}$/.test(p.time ?? '')) continue;
    const [h, m] = p.time.split(':').map(Number);
    const cand = new Date(now);
    cand.setDate(now.getDate() + ((dn - now.getDay() + 7) % 7));
    cand.setHours(h, m, 0, 0);
    if (cand.getTime() <= now.getTime()) cand.setDate(cand.getDate() + 7);
    if (!next || cand < next.date) next = { date: cand, name: p.name, time: p.time };
  }
  const nextLabel = next ? next.date.toLocaleDateString(INTL_TAG[locale], { weekday: 'long' }) : '';
  const utility = {
    serviceLine: next ? `${dict.header.nextProgram} ${nextLabel} ${next.time} · ${next.name}` : undefined,
    phone: contact?.phone,
  };

  const s = style ?? FALLBACK_STYLE;
  const theme = {
    '--primary-color': s.primaryColor,
    '--second-primary-color': s.secondPrimaryColor,
    '--accent-color': s.accentColor,
    '--second-accent-color': s.secondAccentColor,
  } as CSSProperties;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={HTML_LANG[locale]} className={font.variable} style={theme}>
      <body>
        {underConstruction ? (
          <main className="container section">
            <h1>{churchInfo?.churchName || SITE_NAME}</h1>
            <p>{locale === 'en' ? 'Site under construction. We will be back soon.' : 'Site în construcție. Revenim în curând.'}</p>
          </main>
        ) : (
          <>
            <Header churchInfo={churchInfo} utility={utility} locale={locale} />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <Footer churchInfo={churchInfo} locale={locale} />
          </>
        )}
        <JsonLd data={[churchJsonLd(churchInfo, contact, programs, locale), websiteJsonLd(locale)]} />
        {gaId && <AnalyticsConsent gaId={gaId} locale={locale} />}
      </body>
    </html>
  );
}
