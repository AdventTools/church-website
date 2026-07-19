import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { BLUR } from '@/lib/blur';
import { t, localePath } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './Hero.module.scss';

type Props = { title: string; description?: string; image?: string; locale: Locale };

export default function Hero({ title, description, image, locale }: Props) {
  const dict = t(locale);
  return (
    <section className={styles.hero}>
      {image && (
        <div className={styles.bg} aria-hidden>
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR}
            className={styles.img}
          />
        </div>
      )}
      <div className={styles.overlay} aria-hidden />

      <div className={`container ${styles.inner}`}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        <Link href={localePath(locale, '/program')} className={`btn ${styles.cta}`}>
          {dict.hero.cta}
        </Link>
      </div>

      <a href="#continut" className={styles.scroll} aria-label={dict.hero.scrollAria}>
        <ChevronDown size={26} />
      </a>
    </section>
  );
}
