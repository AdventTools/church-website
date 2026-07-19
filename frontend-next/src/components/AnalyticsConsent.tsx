'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './AnalyticsConsent.module.scss';

const KEY = 'cookie-consent'; // 'granted' | 'denied'

// Banner de consimțământ (UE): Google Analytics se încarcă DOAR după „Accept”.
export default function AnalyticsConsent({ gaId, locale }: { gaId: string; locale: Locale }) {
  const [choice, setChoice] = useState<string | null>('pending');
  const dict = t(locale).cookies;

  useEffect(() => {
    try {
      setChoice(localStorage.getItem(KEY));
    } catch {
      setChoice(null);
    }
  }, []);

  const decide = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setChoice(value);
  };

  return (
    <>
      {choice === 'granted' && <GoogleAnalytics gaId={gaId} />}

      {choice === null && (
        <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Cookies">
          <p className={styles.text}>{dict.text}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.reject} onClick={() => decide('denied')}>
              {dict.reject}
            </button>
            <button type="button" className={styles.accept} onClick={() => decide('granted')}>
              {dict.accept}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
