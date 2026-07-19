import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import Reveal from '@/components/Reveal';
import ArticleCard from '@/components/ArticleCard';
import JsonLd from '@/components/JsonLd';
import { getArticles, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './blog.module.scss';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  return pageMetadata({ locale, title: dict.blog.title, description: dict.blog.meta, path: '/blog' });
}

export default async function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);

  const [articles, bg] = await Promise.all([getArticles(locale), getBackgroundImages()]);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'CollectionPage', name: dict.blog.title, path: localePath(locale, '/blog'), description: dict.blog.meta, locale }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.blog.title, path: localePath(locale, '/blog') },
          ]),
        ]}
      />
      <PageHeader title={dict.blog.title} image={bg.home} />

      <Section>
        {articles.length > 0 ? (
          <>
            <p className={styles.intro}>{dict.blog.intro}</p>
            <div className={styles.grid}>
              {articles.map((a, i) => (
                <Reveal key={a.id} delay={i * 60}>
                  <ArticleCard article={a} locale={locale} />
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <p>{dict.blog.empty}</p>
        )}
      </Section>
    </>
  );
}
