import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Article, Locale } from '@/lib/types';
import { t } from '@/lib/i18n';
import { articleHref, formatToLocalDate } from '@/lib/utils';
import { BLUR } from '@/lib/blur';
import styles from './ArticleCard.module.scss';

export default function ArticleCard({ article, locale }: { article: Article; locale: Locale }) {
  const href = articleHref(article, locale);
  const dict = t(locale).blog;
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.image}>
        {article.coverSmall ? (
          <Image
            src={article.coverSmall}
            alt={article.title}
            fill
            sizes="(max-width: 700px) 100vw, 380px"
            placeholder="blur"
            blurDataURL={BLUR}
          />
        ) : (
          <span className={styles.placeholder} aria-hidden />
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          {article.date && <time dateTime={article.date}>{formatToLocalDate(article.date, locale)}</time>}
          {article.author && (
            <span>
              {dict.by} {article.author}
            </span>
          )}
        </div>
        <h2 className={styles.title}>{article.title}</h2>
        {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
        <span className={styles.more}>
          {dict.readMore} <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
