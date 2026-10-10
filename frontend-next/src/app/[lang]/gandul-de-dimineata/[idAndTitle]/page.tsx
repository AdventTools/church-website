import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import Markdown from '@/components/Markdown';
import { getDevotionalBySlug, getDevotionalByOldSlug, getDevotionals } from '@/lib/strapi';
import { detailSeg, devotionalHref, legacyId, formatToLocalDate, summarize } from '@/lib/utils';
import { pageMetadata, absoluteUrl, SITE_URL, SITE_NAME } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Devotional, Locale } from '@/lib/types';
import { cleanVerse } from '../verse';
import styles from './devotional.module.scss';

export const revalidate = 60;

const BASE = '/gandul-de-dimineata';

const plain = (md: string): string => md.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*_>`~]/g, '');

// Sub atâtea caractere o descriere e prea săracă pentru un rezultat de căutare.
const MIN_DESC = 120;

// Versetul singur nu e o descriere bună: multe sunt scurte, iar unele se repetă în zile diferite.
// Când versetul nu umple singur fereastra utilă, îl continuăm cu începutul textului zilei.
function devotionalSummary(d: Devotional, max: number): string {
  const verse = cleanVerse(d.verse, d.verseReference)?.text ?? '';
  const body = plain(d.content);
  const text = verse.length >= MIN_DESC ? verse : [verse, body].filter(Boolean).join(' ');
  return summarize(text, max);
}

// Slug curent → pagina; slug vechi → 301 către cel curent; forma „{id}-{titlu}" → ce rămâne după id.
async function resolveDevotional(seg: string, locale: Locale): Promise<{ devotional: Devotional | null; redirectTo: string | null }> {
  const bySlug = await getDevotionalBySlug(seg, locale);
  if (bySlug) return { devotional: bySlug, redirectTo: null };
  const byOld = await getDevotionalByOldSlug(seg, locale);
  if (byOld?.slug) return { devotional: byOld, redirectTo: devotionalHref(byOld, locale) };
  if (legacyId(seg)) {
    const byTail = await getDevotionalBySlug(seg.replace(/^\d+-/, ''), locale);
    if (byTail) return { devotional: byTail, redirectTo: devotionalHref(byTail, locale) };
  }
  return { devotional: null, redirectTo: null };
}

function devotionalLanguages(d: Devotional, locale: Locale): Record<string, string> {
  const seg = detailSeg(d);
  const self = d.locale ?? locale;
  const urls: Record<string, string> = { [self]: absoluteUrl(localePath(self, `${BASE}/${seg}`)) };
  if (d.alt) urls[d.alt.locale] = absoluteUrl(localePath(d.alt.locale, `${BASE}/${d.alt.slug || seg}`));
  return { ...urls, 'x-default': urls.ro ?? urls[self] };
}

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const locale: Locale = isLocale(params.lang) ? params.lang : 'ro';
  return (await getDevotionals(locale)).map((d) => ({ idAndTitle: detailSeg(d) }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; idAndTitle: string }> }): Promise<Metadata> {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const { devotional } = await resolveDevotional(idAndTitle, locale);
  if (!devotional) return { title: t(locale).devotionals.title, robots: { index: false, follow: false } };

  return pageMetadata({
    locale,
    title: devotional.title,
    description: devotionalSummary(devotional, 160),
    path: `${BASE}/${detailSeg(devotional)}`,
    type: 'article',
    languages: devotionalLanguages(devotional, locale),
  });
}

export default async function DevotionalDetail({ params }: { params: Promise<{ lang: string; idAndTitle: string }> }) {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const { devotional, redirectTo } = await resolveDevotional(idAndTitle, locale);
  if (!devotional) notFound();
  if (redirectTo && redirectTo !== localePath(locale, `${BASE}/${idAndTitle}`)) permanentRedirect(redirectTo);

  const path = devotionalHref(devotional, locale);
  const verse = cleanVerse(devotional.verse, devotional.verseReference);
  const excerpt = devotionalSummary(devotional, 300);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: devotional.title,
    description: excerpt,
    inLanguage: locale === 'en' ? 'en-GB' : 'ro-RO',
    ...(devotional.date ? { datePublished: devotional.date, dateModified: devotional.date } : {}),
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Church', '@id': `${SITE_URL}/#church`, name: SITE_NAME },
    mainEntityOfPage: absoluteUrl(path),
  };

  return (
    <>
      <JsonLd
        data={[
          jsonLd,
          webPageJsonLd({ name: devotional.title, path, description: excerpt, locale, speakable: true }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.devotionals.title, path: localePath(locale, BASE) },
            { name: devotional.title, path },
          ]),
        ]}
      />

      <article>
        <header className={styles.head}>
          <div className="container">
            <Link href={localePath(locale, BASE)} className={styles.back}>
              <ArrowLeft size={18} aria-hidden /> {dict.devotionals.back}
            </Link>
            <h1 className={styles.title}>{devotional.title}</h1>
            {devotional.date && (
              <p className={styles.meta}>
                <time dateTime={devotional.date}>{formatToLocalDate(devotional.date, locale)}</time>
              </p>
            )}
          </div>
        </header>

        <div className={`container ${styles.body}`}>
          {verse && (
            <figure className={styles.verse}>
              <blockquote className={styles.verseText}>
                <p>{verse.text}</p>
              </blockquote>
              {verse.reference && (
                <figcaption className={styles.verseRef}>
                  <cite>{verse.reference}</cite>
                </figcaption>
              )}
            </figure>
          )}

          <Markdown>{devotional.content}</Markdown>
        </div>
      </article>
    </>
  );
}
