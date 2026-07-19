import type { ComponentType } from 'react';
import Link from 'next/link';
import { HeartHandshake, ArrowRight, BookOpen, Users, Sunrise, HeartPulse, Heart, Music, BookMarked } from 'lucide-react';
import Hero from '@/components/Hero';
import Section from '@/components/Section';
import EventCard from '@/components/EventCard';
import ShuffledProjects from '@/components/ShuffledProjects';
import ArticleCard from '@/components/ArticleCard';
import ProgramDay from '@/components/ProgramDay';
import NextProgram from '@/components/NextProgram';
import AboutExcerpt from '@/components/AboutExcerpt';
import LivePlayer from '@/components/LivePlayer';
import Sermons from '@/components/Sermons';
import Reveal from '@/components/Reveal';
import JsonLd from '@/components/JsonLd';
import { getHomePage, getBackgroundImages, getPrograms, getUpcomingEvents, getArchivedEvents, getProjects, getArticles, getBeliefs } from '@/lib/strapi';
import { getLatestVideos } from '@/lib/youtube';
import { videoListJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { summarize } from '@/lib/utils';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './home.module.scss';

export const revalidate = 60;

const VALUE_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  bible: BookOpen,
  community: Users,
  hope: Sunrise,
  health: HeartPulse,
  prayer: HeartHandshake,
  love: Heart,
  service: HeartHandshake,
  music: Music,
};

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);

  const [home, bg, programs, upcoming, pastEvents, videos, projects, articles, beliefs] = await Promise.all([
    getHomePage(locale),
    getBackgroundImages(),
    getPrograms(locale),
    getUpcomingEvents(3, locale),
    getArchivedEvents(3, locale),
    getLatestVideos(6),
    getProjects(locale),
    getArticles(locale),
    getBeliefs(locale),
  ]);
  const beliefsTeaser = beliefs?.intro ? summarize(beliefs.intro, 145) : '';
  // Sumar evenimente pe homepage: cele viitoare (primele 3) sau, dacă nu sunt, cele recente din arhivă.
  const homeEvents = (upcoming.length ? upcoming : pastEvents).slice(0, 3);
  const eventsAreUpcoming = upcoming.length > 0;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          type: 'WebPage',
          name: home?.title || dict.hero.defaultTitle,
          path: localePath(locale, '/'),
          description: home?.description,
          locale,
          speakable: true,
        })}
      />
      <Hero title={home?.title || dict.hero.defaultTitle} description={home?.description} image={bg.home} locale={locale} />
      <span id="continut" />

      <LivePlayer />

      {home?.aboutUs && (
        <Section>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutMain}>
              <h2 className={styles.aboutHeading}>{dict.home.about}</h2>
              <AboutExcerpt text={home.aboutUs} locale={locale} />
              <Link href={localePath(locale, '/despre')} className={`btn ${styles.aboutCta}`}>
                {dict.home.aboutCta}
              </Link>
            </div>
            {beliefsTeaser && (
              <Link href={localePath(locale, '/ce-credem')} className={styles.beliefsCard}>
                <span className={styles.beliefsIcon} aria-hidden>
                  <BookMarked size={24} />
                </span>
                <h2 className={styles.beliefsHeading}>{dict.home.beliefsTitle}</h2>
                <p className={styles.beliefsText}>{beliefsTeaser}</p>
                <span className={styles.beliefsMore}>
                  {dict.home.beliefsMore} <ArrowRight size={16} />
                </span>
              </Link>
            )}
          </div>
        </Section>
      )}

      {home?.values && home.values.length > 0 && (
        <Section
          title={dict.home.valuesTitle}
          className="section--surface"
          cta={{ href: localePath(locale, '/ce-credem'), label: dict.home.valuesMore }}
        >
          <div className={styles.values}>
            {home.values.map((v, i) => {
              const Icon = VALUE_ICONS[v.icon] ?? Sunrise;
              return (
                <Reveal key={i} delay={i * 60}>
                  <article className={styles.value}>
                    <span className={styles.valueIcon} aria-hidden>
                      <Icon size={26} />
                    </span>
                    <h3 className={styles.valueTitle}>{v.title}</h3>
                    <p className={styles.valueText}>{v.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Section>
      )}

      <div className="container">
        <Reveal>
          <Link href={localePath(locale, '/prima-vizita')} className={styles.firstVisit}>
            <span className={styles.fvIcon} aria-hidden>
              <HeartHandshake size={28} />
            </span>
            <span className={styles.fvBody}>
              <strong>{dict.home.fvTitle}</strong>
              <span>{dict.home.fvText}</span>
            </span>
            <span className={styles.fvArrow} aria-hidden>
              <ArrowRight size={20} />
            </span>
          </Link>
        </Reveal>
      </div>

      {videos.length > 0 && (
        <Section
          id="predici"
          title={dict.home.sermons}
          cta={{ href: localePath(locale, '/evenimente'), label: dict.home.sermonsCta }}
          className="section--surface"
        >
          <Sermons videos={videos} locale={locale} />
        </Section>
      )}

      {programs.length > 0 && (
        <Section title={dict.home.schedule} cta={{ href: localePath(locale, '/program'), label: dict.home.scheduleCta }}>
          <NextProgram programs={programs} locale={locale} />
          <div className={styles.days}>
            {[6, 0].map((d) => (
              <ProgramDay key={d} dayNumber={d} programs={programs} locale={locale} />
            ))}
          </div>
        </Section>
      )}

      {homeEvents.length > 0 && (
        <Section
          title={dict.home.events}
          cta={{ href: localePath(locale, '/evenimente'), label: dict.home.eventsCta }}
          className="section--surface"
        >
          <p className={styles.eventsLead}>{eventsAreUpcoming ? dict.home.eventsUpcomingLead : dict.home.eventsPastLead}</p>
          <div className={styles.events}>
            {homeEvents.map((e) => (
              <EventCard key={e.id} event={e} locale={locale} />
            ))}
          </div>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title={dict.projects.title} cta={{ href: localePath(locale, '/proiecte'), label: dict.projects.learnMore }}>
          <ShuffledProjects projects={projects} locale={locale} limit={3} />
        </Section>
      )}

      {articles.length > 0 && (
        <Section
          title={dict.blog.title}
          cta={{ href: localePath(locale, '/blog'), label: dict.blog.readMore }}
          className="section--surface"
        >
          <div className={styles.projects}>
            {articles.slice(0, 3).map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} />
            ))}
          </div>
        </Section>
      )}

      {videos.length > 0 && <JsonLd data={videoListJsonLd(videos)} />}
    </>
  );
}
