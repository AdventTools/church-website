import Link from 'next/link';
import Image from 'next/image';
import { Images } from 'lucide-react';
import type { Locale, PhotoAlbum } from '@/lib/types';
import { albumHref, formatToLocalDate } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { BLUR } from '@/lib/blur';
import styles from './AlbumCard.module.scss';

export default function AlbumCard({ album, locale = 'ro', headingLevel = 3 }: { album: PhotoAlbum; locale?: Locale; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const count = album.photos.length;
  const g = t(locale).gallery;
  return (
    <Link href={albumHref(album, locale)} className={styles.card}>
      <div className={styles.cover}>
        <span className={`${styles.sheet} ${styles.sheetA}`} aria-hidden />
        <span className={`${styles.sheet} ${styles.sheetB}`} aria-hidden />
        <div className={styles.top}>
          {album.cover && (
            <Image
              src={album.cover.large || album.cover.small}
              alt={album.cover.alt}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1000px) 46vw, 360px"
              placeholder="blur"
              blurDataURL={BLUR}
            />
          )}
          <span className={styles.count}>
            <Images size={14} aria-hidden />
            {count}
          </span>
        </div>
      </div>
      <Heading className={styles.title}>{album.title}</Heading>
      <p className={styles.meta}>
        <time dateTime={album.date}>{formatToLocalDate(album.date, locale)}</time> · {g.count.photos(count)}
      </p>
    </Link>
  );
}
