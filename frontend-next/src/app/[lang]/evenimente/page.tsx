import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import EventRevealList from '@/components/EventRevealList';
import JsonLd from '@/components/JsonLd';
import { getUpcomingEvents, getArchivedEvents, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './evenimente.module.scss';

export const revalidate = 60;

const UPCOMING_INITIAL = 6;
const PAST_INITIAL = 3;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  return pageMetadata({ locale, title: dict.events.title, description: dict.events.meta, path: '/evenimente' });
}

export default async function EvenimentePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);

  const [upcoming, past, bg] = await Promise.all([
    getUpcomingEvents(50, locale),
    getArchivedEvents(40, locale),
    getBackgroundImages(),
  ]);

  const hasUpcoming = upcoming.length > 0;
  const hasPast = past.length > 0;
  const base = localePath(locale, '/evenimente');

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'CollectionPage', name: dict.events.title, path: base, description: dict.events.meta, locale }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.events.title, path: base },
          ]),
        ]}
      />
      <PageHeader title={dict.events.title} image={bg.home} />

      {!hasUpcoming && !hasPast ? (
        <Section>
          <p>{dict.events.empty}</p>
        </Section>
      ) : (
        <>
          {hasUpcoming && (
            <Section title={dict.events.upcoming}>
              <p className={styles.lead}>{dict.events.upcomingIntro}</p>
              <EventRevealList
                events={upcoming}
                locale={locale}
                initial={UPCOMING_INITIAL}
                moreLabel={dict.events.showMore}
                lessLabel={dict.events.showLess}
              />
            </Section>
          )}

          {hasPast && (
            <Section title={dict.events.past} className={hasUpcoming ? 'section--surface' : ''}>
              <p className={styles.lead}>{dict.events.pastIntro}</p>
              <EventRevealList
                events={past}
                locale={locale}
                initial={PAST_INITIAL}
                moreLabel={dict.events.showMore}
                lessLabel={dict.events.showLess}
              />
            </Section>
          )}
        </>
      )}
    </>
  );
}
