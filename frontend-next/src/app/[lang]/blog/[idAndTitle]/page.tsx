import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import Markdown from '@/components/Markdown';
import { getArticleBySlug, getArticleByOldSlug, getArticle, getAllArticles } from '@/lib/strapi';
import { detailSeg, legacyId, formatToLocalDate } from '@/lib/utils';
import { pageMetadata, absoluteUrl, SITE_URL, SITE_NAME } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import { BLUR } from '@/lib/blur';
import type { Article, Locale } from '@/lib/types';
import styles from './article.module.scss';

export const revalidate = 60;

async function resolveArticle(seg: string, locale: Locale): Promise<{ article: Article | null; redirectTo: string | null }> {
  const bySlug = await getArticleBySlug(seg, locale);
  if (bySlug) return { article: bySlug, redirectTo: null };
  const byOld = await getArticleByOldSlug(seg, locale);
  if (byOld?.slug) return { article: byOld, redirectTo: `/blog/${byOld.slug}` };
  const id = legacyId(seg);
  if (id) {
    const byId = await getArticle(id);
    if (byId) return { article: byId, redirectTo: byId.slug ? `/blog/${byId.slug}` : null };
  }
  return { article: null, redirectTo: null };
}

function articleLanguages(a: Article, locale: Locale): Record<string, string> {
  const seg = detailSeg(a);
  const self = a.locale ?? locale;
  const urls: Record<string, string> = { [self]: absoluteUrl(localePath(self, `/blog/${seg}`)) };
  if (a.alt) urls[a.alt.locale] = absoluteUrl(localePath(a.alt.locale, `/blog/${a.alt.slug || seg}`));
  return { ...urls, 'x-default': urls.ro ?? urls[self] };
}

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const locale: Locale = isLocale(params.lang) ? params.lang : 'ro';
  const articles = await getAllArticles(locale);
  return articles.map((a) => ({ idAndTitle: detailSeg(a) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; idAndTitle: string }>;
}): Promise<Metadata> {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const { article } = await resolveArticle(idAndTitle, locale);
  if (!article) {
    return { title: locale === 'en' ? 'Article' : 'Articol', robots: { index: false, follow: false } };
  }
  const description = (article.excerpt || article.content || '').replace(/[#*_>`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
  return pageMetadata({
    locale,
    title: article.title,
    description,
    path: `/blog/${detailSeg(article)}`,
    image: article.coverLarge || article.coverSmall,
    type: 'article',
    languages: articleLanguages(article, locale),
  });
}

export default async function ArticleDetail({ params }: { params: Promise<{ lang: string; idAndTitle: string }> }) {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const { article, redirectTo } = await resolveArticle(idAndTitle, locale);
  if (!article) notFound();
  if (redirectTo) permanentRedirect(localePath(locale, redirectTo));

  const seg = detailSeg(article);
  const cover = article.coverLarge || article.coverSmall;
  const backText = locale === 'en' ? 'Back to blog' : 'Înapoi la blog';
  const description = (article.excerpt || article.content).replace(/[#*_>`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 300);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description,
    inLanguage: locale === 'en' ? 'en-GB' : 'ro-RO',
    ...(article.date ? { datePublished: article.date, dateModified: article.date } : {}),
    ...(cover ? { image: absoluteUrl(cover) } : {}),
    author: { '@type': 'Organization', name: article.author || SITE_NAME },
    publisher: { '@type': 'Church', '@id': `${SITE_URL}/#church`, name: SITE_NAME },
    mainEntityOfPage: absoluteUrl(localePath(locale, `/blog/${seg}`)),
  };

  return (
    <>
      <JsonLd
        data={[
          jsonLd,
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.blog.title, path: localePath(locale, '/blog') },
            { name: article.title, path: localePath(locale, `/blog/${seg}`) },
          ]),
        ]}
      />

      <header className={styles.head}>
        <div className="container">
          <Link href={localePath(locale, '/blog')} className={styles.back}>
            <ArrowLeft size={18} /> {backText}
          </Link>
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.meta}>
            {article.date && <time dateTime={article.date}>{formatToLocalDate(article.date, locale)}</time>}
            {article.author && (
              <span>
                {dict.blog.by} {article.author}
              </span>
            )}
          </div>
        </div>
      </header>

      {cover && (
        <div className={styles.coverWrap}>
          <div className="container">
            <Image
              className={styles.cover}
              src={cover}
              alt={article.title}
              width={article.coverWidth ?? 1200}
              height={article.coverHeight ?? 800}
              sizes="(max-width: 820px) 100vw, 820px"
              placeholder="blur"
              blurDataURL={BLUR}
              priority
            />
          </div>
        </div>
      )}

      <article className={`container ${styles.article}`}>
        <Markdown>{article.content}</Markdown>
      </article>
    </>
  );
}
