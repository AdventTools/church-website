'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/types';
import styles from './AboutExcerpt.module.scss';

const LABEL: Record<Locale, { more: string; less: string }> = {
  ro: { more: 'Citește mai mult', less: 'Citește mai puțin' },
  en: { more: 'Read more', less: 'Read less' },
};

export default function AboutExcerpt({ text, locale = 'ro' }: { text: string; locale?: Locale }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 320;
  const l = LABEL[locale] ?? LABEL.ro;

  return (
    <div>
      <p className={`${styles.text} ${long && !open ? styles.clamped : ''}`}>{text}</p>
      {long && (
        <button className={styles.toggle} onClick={() => setOpen(!open)} type="button">
          {open ? l.less : l.more}
        </button>
      )}
    </div>
  );
}
