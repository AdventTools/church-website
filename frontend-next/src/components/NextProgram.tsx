'use client';

import { useState, useEffect } from 'react';
import { CalendarClock } from 'lucide-react';
import { formatToLocalDayName } from '@/lib/utils';
import type { Program, Locale } from '@/lib/types';
import styles from './NextProgram.module.scss';

const DAY_JS: Record<string, number> = { Duminica: 0, Luni: 1, Marti: 2, Miercuri: 3, Joi: 4, Vineri: 5, Sambata: 6 };

// Rând elegant care arată următorul program din orar, cu ora — calculat din ora reală a vizitatorului.
export default function NextProgram({ programs, locale }: { programs: Program[]; locale: Locale }) {
  const [next, setNext] = useState<{ name: string; date: Date; time: string } | null>(null);

  useEffect(() => {
    const now = new Date();
    let best: { name: string; date: Date; time: string } | null = null;
    for (const p of programs) {
      const target = DAY_JS[p.day];
      if (target === undefined || !p.time) continue;
      const [h, m] = p.time.split(':').map(Number);
      const cand = new Date(now);
      const delta = (target - now.getDay() + 7) % 7;
      cand.setDate(now.getDate() + delta);
      cand.setHours(h, m, 0, 0);
      if (cand.getTime() <= now.getTime()) cand.setDate(cand.getDate() + 7);
      if (!best || cand.getTime() < best.date.getTime()) best = { name: p.name, date: cand, time: p.time };
    }
    setNext(best);
  }, [programs]);

  if (!next) return null;
  const day = formatToLocalDayName(next.date, locale);
  const label = locale === 'en' ? 'Coming up next' : 'Următorul program';
  const when = locale === 'en' ? `${day}, ${next.time}` : `${day}, ora ${next.time}`;

  return (
    <div className={styles.band}>
      <span className={styles.icon} aria-hidden>
        <CalendarClock size={20} />
      </span>
      <span className={styles.text}>
        <span className={styles.lead}>{label}:</span> <strong>{next.name}</strong> — {when}
      </span>
    </div>
  );
}
