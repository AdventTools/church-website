import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import Markdown from '@/components/Markdown';
import JsonLd from '@/components/JsonLd';
import { getBeliefs, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './ce-credem.module.scss';

export const revalidate = 60;

const META: Record<Locale, string> = {
  ro: 'Ce credem noi, adventiștii de ziua a șaptea din Cluj-Napoca: Biblia, Isus Hristos și mântuirea, Sabatul, revenirea lui Isus, botezul, comunitatea, sănătatea și speranța vieții veșnice.',
  en: 'What we, the Seventh-day Adventists in Cluj-Napoca, believe: the Bible, Jesus Christ and salvation, the Sabbath, the return of Jesus, baptism, community, health, and the hope of eternal life.',
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const beliefs = await getBeliefs(locale);
  return pageMetadata({
    locale,
    title: beliefs?.title || (locale === 'en' ? 'What we believe' : 'Ce credem'),
    description: beliefs?.intro?.slice(0, 160) || META[locale],
    path: '/ce-credem',
  });
}

export default async function CeCredemPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);

  const [beliefs, bg] = await Promise.all([getBeliefs(locale), getBackgroundImages()]);
  const title = beliefs?.title || (locale === 'en' ? 'What we believe' : 'Ce credem');

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'AboutPage', name: title, path: localePath(locale, '/ce-credem'), description: META[locale], locale, speakable: true }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: title, path: localePath(locale, '/ce-credem') },
          ]),
        ]}
      />
      <PageHeader title={title} image={bg.home} />
      <Section>
        <div className={styles.body}>
          {beliefs?.intro && <p className={styles.intro}>{beliefs.intro}</p>}
          {beliefs?.content && <Markdown>{beliefs.content}</Markdown>}
        </div>
      </Section>
    </>
  );
}
