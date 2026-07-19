import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import type { ChurchEvent, Locale } from '@/lib/types';
import { eventHref, getFormattedPeriod, hasEventDetail } from '@/lib/utils';
import { BLUR } from '@/lib/blur';
import styles from './EventCard.module.scss';

export default function EventCard({ event, locale = 'ro' }: { event: ChurchEvent; locale?: Locale }) {
  const past = new Date(event.endDate) < new Date();
  const clickable = hasEventDetail(event);
  const hasImg = !!event.smallImg;
  const cls = `${styles.card} ${hasImg ? '' : styles.compact} ${past ? styles.past : ''} ${clickable ? styles.clickable : ''}`;

  const inner = (
    <>
      {hasImg ? (
        <div className={styles.image}>
          <Image src={event.smallImg} alt={event.title} fill sizes="(max-width: 700px) 100vw, 360px" placeholder="blur" blurDataURL={BLUR} />
        </div>
      ) : (
        <span className={styles.icon} aria-hidden>
          <CalendarDays size={20} />
        </span>
      )}
      <div className={styles.body}>
        <span className={styles.period}>{getFormattedPeriod(event.startDate, event.endDate, locale)}</span>
        <h3 className={styles.title}>{event.title}</h3>
      </div>
    </>
  );

  return clickable ? (
    <Link href={eventHref(event, locale)} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
