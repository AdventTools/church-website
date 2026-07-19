import Link from 'next/link';
import Image from 'next/image';
import type { ChurchEvent, Locale } from '@/lib/types';
import { eventHref, getFormattedPeriod, summarize, hasEventDetail } from '@/lib/utils';
import { BLUR } from '@/lib/blur';
import styles from './EventListItem.module.scss';

export default function EventListItem({ event, locale = 'ro' }: { event: ChurchEvent; locale?: Locale }) {
  const past = new Date(event.endDate) < new Date();
  const clickable = hasEventDetail(event);
  const hasImg = !!event.smallImg;
  const cls = `${styles.item} ${hasImg ? '' : styles.noImage} ${past ? styles.past : ''} ${clickable ? styles.clickable : ''}`;

  const inner = (
    <>
      {hasImg && (
        <div className={styles.image}>
          <Image src={event.smallImg} alt={event.title} fill sizes="(max-width: 620px) 100vw, 220px" placeholder="blur" blurDataURL={BLUR} />
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.period}>{getFormattedPeriod(event.startDate, event.endDate, locale)}</span>
        </div>
        <h3 className={styles.title}>{event.title}</h3>
        {event.intro && <p className={styles.summary}>{summarize(event.intro, 180)}</p>}
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
