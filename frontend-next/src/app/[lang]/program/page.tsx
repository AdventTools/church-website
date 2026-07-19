import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import ProgramDay from '@/components/ProgramDay';
import JsonLd from '@/components/JsonLd';
import { getPrograms, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd, recurringServicesJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './program.module.scss';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  return pageMetadata({ locale, title: dict.schedule.title, description: dict.schedule.meta, path: '/program' });
}

// Vineri și Sâmbătă (Sabatul) primele, apoi restul săptămânii.
const WEEK_ORDER = [6, 7, 1, 2, 3, 4, 5];

export default async function ProgramPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);

  const [programs, bg] = await Promise.all([getPrograms(locale), getBackgroundImages()]);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'WebPage', name: dict.schedule.title, path: localePath(locale, '/program'), description: dict.schedule.meta, locale }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.schedule.title, path: localePath(locale, '/program') },
          ]),
          ...(programs.length ? [recurringServicesJsonLd(programs, locale)] : []),
        ]}
      />
      <PageHeader title={dict.schedule.title} image={bg.program || bg.home} />
      <Section>
        {programs.length > 0 ? (
          <div className={styles.days}>
            {WEEK_ORDER.map((d) => (
              <ProgramDay key={d} dayNumber={d} programs={programs} locale={locale} headingLevel="h2" />
            ))}
          </div>
        ) : (
          <p>{dict.schedule.empty}</p>
        )}
      </Section>
    </>
  );
}
