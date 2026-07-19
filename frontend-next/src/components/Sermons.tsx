'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Play, X } from 'lucide-react';
import type { Video } from '@/lib/youtube';
import { t, INTL_TAG } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './Sermons.module.scss';

function formatDate(iso: string, locale: Locale): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(INTL_TAG[locale], { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function Sermons({ videos, locale = 'ro' }: { videos: Video[]; locale?: Locale }) {
  const [active, setActive] = useState<Video | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active]);

  return (
    <>
      <div className={styles.grid}>
        {videos.map((v) => (
          <button key={v.id} className={styles.card} type="button" onClick={() => setActive(v)}>
            <span className={styles.thumb}>
              <Image src={v.thumb} alt={v.title} width={480} height={360} sizes="(max-width: 700px) 100vw, 360px" />
              <span className={styles.play} aria-hidden>
                <Play size={24} fill="currentColor" />
              </span>
            </span>
            <span className={styles.info}>
              <span className={styles.vtitle}>{v.title}</span>
              {v.published && <time className={styles.date}>{formatDate(v.published, locale)}</time>}
            </span>
          </button>
        ))}
      </div>

      {active &&
        mounted &&
        createPortal(
          <div className={styles.modal} onClick={() => setActive(null)} role="dialog" aria-modal="true">
            <button className={styles.close} type="button" aria-label={t(locale).a11y.close}>
              <X size={28} />
            </button>
            <div className={styles.player} onClick={(e) => e.stopPropagation()}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&rel=0`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
