import type { ComponentType } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Clock, MapPin, Car, Baby, Shirt, Languages, Music, BookOpen, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import Reveal from '@/components/Reveal';
import FaqAccordion from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import { getFirstVisit, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './prima-vizita.module.scss';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  return pageMetadata({ locale, title: dict.nav.firstVisit, description: dict.firstVisit.meta, path: '/prima-vizita' });
}

const ICONS: Record<string, ComponentType<{ size?: number }>> = {
  welcome: Sparkles,
  clock: Clock,
  location: MapPin,
  parking: Car,
  kids: Baby,
  dress: Shirt,
  language: Languages,
  music: Music,
  book: BookOpen,
};

export default async function PrimaVizitaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);

  const [data, bg] = await Promise.all([getFirstVisit(locale), getBackgroundImages()]);

  const title = data?.title || dict.nav.firstVisit;
  const highlights = data?.highlights ?? [];
  const faqs = data?.faqs ?? [];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'WebPage', name: title, path: localePath(locale, '/prima-vizita'), description: dict.firstVisit.meta, locale, speakable: true }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: title, path: localePath(locale, '/prima-vizita') },
          ]),
          ...(faqs.length ? [faqJsonLd(faqs.map((f) => ({ q: f.question, a: f.answer })))] : []),
        ]}
      />

      <PageHeader title={title} image={bg.home} />

      <Section>
        {(data?.subtitle || data?.intro) && (
          <div className={styles.intro}>
            {data?.subtitle && <p className={styles.lead}>{data.subtitle}</p>}
            {data?.intro && <p className={styles.introText}>{data.intro}</p>}
          </div>
        )}

        {highlights.length > 0 && (
          <div className={styles.cards}>
            {highlights.map((h, i) => {
              const Icon = ICONS[h.icon] ?? Sparkles;
              return (
                <Reveal key={i} delay={i * 60}>
                  <article className={styles.card}>
                    <span className={styles.cardIcon} aria-hidden>
                      <Icon size={24} />
                    </span>
                    <h2 className={styles.cardTitle}>{h.title}</h2>
                    <p className={styles.cardText}>{h.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </Section>

      {faqs.length > 0 && (
        <Section title={dict.firstVisit.faqTitle} className={styles.faqSection}>
          <FaqAccordion items={faqs} />
        </Section>
      )}

      <Section>
        <div className={styles.closing}>
          <h2>{data?.closingTitle || dict.firstVisit.closingTitle}</h2>
          {data?.closingText && <p>{data.closingText}</p>}
          <div className={styles.closingActions}>
            <Link href={localePath(locale, '/contact')} className="btn">
              {dict.firstVisit.ctaContact} <ArrowRight size={18} />
            </Link>
            <Link href={localePath(locale, '/program')} className={styles.ghostBtn}>
              {dict.firstVisit.ctaSchedule}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
