'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import EventListItem from './EventListItem';
import type { ChurchEvent, Locale } from '@/lib/types';
import styles from './EventRevealList.module.scss';

// Listă de evenimente cu „vezi mai multe”: afișează primele `initial`, restul la cerere.
export default function EventRevealList({
  events,
  locale,
  initial,
  moreLabel,
  lessLabel,
}: {
  events: ChurchEvent[];
  locale: Locale;
  initial: number;
  moreLabel: string;
  lessLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? events : events.slice(0, initial);
  const hidden = events.length - initial;

  return (
    <>
      <div className={styles.list}>
        {shown.map((e) => (
          <EventListItem key={e.id} event={e} locale={locale} />
        ))}
      </div>
      {hidden > 0 && (
        <button type="button" className={styles.moreBtn} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? lessLabel : `${moreLabel} (${hidden})`}
          <ChevronDown size={18} className={open ? styles.chevOpen : styles.chev} aria-hidden />
        </button>
      )}
    </>
  );
}
