import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Quote } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import Reveal from '@/components/Reveal';
import Pagination from '@/components/Pagination';
import JsonLd from '@/components/JsonLd';
import { getPaginatedDevotionals, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd, dailyThoughtJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import { devotionalHref, formatToLocalDate, summarize } from '@/lib/utils';
import { getDailyThoughts, SOURCE_NAME, SOURCE_URL } from '@/lib/solascriptura';
import type { Locale } from '@/lib/types';
import { cleanVerse } from './verse';
import styles from './gandul-de-dimineata.module.scss';

export const revalidate = 60;

type Params = Promise<{ lang: string }>;
type Search = Promise<{ page?: string }>;

const BASE = '/gandul-de-dimineata';

// Câte zile dinainte apar sub gândul de azi; restul celor ~30 din flux rămân la sursă.
const PREVIOUS = 6;

const hrefFor = (locale: Locale) => (page: number): string => localePath(locale, page > 1 ? `${BASE}?page=${page}` : BASE);

const toPage = (raw?: string): number => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 1 ? n : 1;
};

// Titlurile încep adesea cu numele paginii („Gândul de dimineață – 12 aprilie”). Pe carduri îl
// scoatem, ca să rămână partea care distinge; titlul întreg rămâne pe pagina devoționalului.
const cardTitle = (title: string): string =>
  title.replace(/^\s*(g[âa]ndul\s+de\s+diminea[țt][ăa]|morning\s+thought)\s*[–—:-]\s*/i, '').trim() || title;

// Paginile 2+ își spun poziția și în descriere; altfel arată ca duplicate între ele.
const describe = (locale: Locale, page: number, pageCount: number): string => {
  const d = t(locale).devotionals;
  return summarize(page > 1 && pageCount >= page ? `${d.page(page, pageCount)} — ${d.meta}` : d.meta, 160);
};

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const d = t(locale).devotionals;
  const page = toPage((await searchParams).page);
  const { pageCount } = await getPaginatedDevotionals(page, locale);
  return pageMetadata({
    locale,
    title: page > 1 ? `${d.title} — ${d.page(page, pageCount)}` : d.title,
    description: describe(locale, page, pageCount),
    path: page > 1 ? `${BASE}?page=${page}` : BASE,
  });
}

export default async function DevotionalsPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const d = dict.devotionals;
  const page = toPage((await searchParams).page);

  // Fluxul Sola Scriptura e doar în română: pe /en rămân devoționalele din CMS.
  const [{ devotionals, pageCount }, bg, daily] = await Promise.all([
    getPaginatedDevotionals(page, locale),
    getBackgroundImages(),
    page === 1 && locale === 'ro' ? getDailyThoughts() : Promise.resolve({ today: null, previous: [] }),
  ]);
  if (page > 1 && page > pageCount) notFound();
  const { today, previous } = daily;

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'CollectionPage', name: d.title, path: hrefFor(locale)(page), description: describe(locale, page, pageCount), locale }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: d.title, path: localePath(locale, BASE) },
          ]),
          ...(today ? [dailyThoughtJsonLd(today)] : []),
        ]}
      />

      <PageHeader title={d.title} image={bg.home} />

      {today && (
        <Section>
          <article className={styles.today} aria-labelledby="gandul-zilei">
            <p className={styles.todayKicker}>
              <span id="gandul-zilei">{d.today}</span> · <time dateTime={today.date}>{formatToLocalDate(today.date, locale)}</time>
            </p>
            <blockquote className={`${styles.todayVerse} speakable`}>
              <p>{today.verse}</p>
              {today.reference && <cite>{today.reference}</cite>}
            </blockquote>
            <div className={styles.todayText}>
              {today.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className={styles.source}>
              {d.source}:{' '}
              <a href={today.url} target="_blank" rel="noopener">
                {SOURCE_NAME}
              </a>
            </p>
          </article>
        </Section>
      )}

      {previous.length > 0 && (
        <Section title={d.previous} className="section--surface">
          <ul className={styles.previous}>
            {previous.slice(0, PREVIOUS).map((p) => (
              <li key={p.date}>
                <a href={p.url} target="_blank" rel="noopener" className={styles.prevCard}>
                  <time dateTime={p.date} className={styles.prevDate}>
                    {formatToLocalDate(p.date, locale)}
                  </time>
                  <span className={styles.verse}>{summarize(p.verse, 160)}</span>
                  {p.reference && <span className={styles.reference}>{p.reference}</span>}
                  <span className={styles.more}>
                    {d.readAtSource} <ArrowUpRight size={16} aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.sourceNote}>
            {d.source}:{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener">
              {SOURCE_NAME}
            </a>
          </p>
        </Section>
      )}

      {(devotionals.length > 0 || !today) && (
        <Section title={today ? d.archive : undefined}>
          {devotionals.length > 0 ? (
            <>
              {page === 1 && <p className={styles.intro}>{d.intro}</p>}

              <div className={styles.grid}>
                {devotionals.map((dv, i) => {
                  const verse = cleanVerse(dv.verse, dv.verseReference);
                  const label = cardTitle(dv.title);
                  return (
                    <Reveal key={dv.id} delay={i * 60}>
                      <article className={styles.card}>
                        <span className={styles.quoteMark} aria-hidden>
                          <Quote size={18} />
                        </span>
                        <h3 className={styles.title}>
                          <Link href={devotionalHref(dv, locale)} className={styles.link}>
                            {dv.date ? <time dateTime={dv.date}>{label}</time> : label}
                          </Link>
                        </h3>
                        {verse && <p className={styles.verse}>{summarize(verse.text, 180)}</p>}
                        {verse?.reference && <p className={styles.reference}>{verse.reference}</p>}
                        <span className={styles.more} aria-hidden>
                          {d.readMore} <ArrowRight size={16} />
                        </span>
                      </article>
                    </Reveal>
                  );
                })}
              </div>

              <Pagination current={page} total={pageCount} hrefFor={hrefFor(locale)} />
            </>
          ) : (
            <p className={styles.empty}>{d.empty}</p>
          )}
        </Section>
      )}
    </>
  );
}
