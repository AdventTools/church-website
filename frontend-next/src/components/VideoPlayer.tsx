'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BLUR } from '@/lib/blur';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './VideoPlayer.module.scss';

// Până la primul clic pagina arată doar imaginea filmului, servită de noi: niciun script și niciun
// cookie de la YouTube. Playerul (de pe domeniul fără cookie-uri) se încarcă abia la „play".
export default function VideoPlayer({
  youtubeId,
  title,
  thumbnail,
  sizes,
  locale = 'ro',
  priority = false,
}: {
  youtubeId: string;
  title: string;
  thumbnail: string;
  sizes: string;
  locale?: Locale;
  priority?: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={styles.frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <button type="button" className={styles.frame} onClick={() => setPlaying(true)} aria-label={`${t(locale).gallery.play}: ${title}`}>
      <Image src={thumbnail} alt="" fill sizes={sizes} placeholder="blur" blurDataURL={BLUR} priority={priority} />
      <span className={styles.play} aria-hidden>
        <svg viewBox="0 0 24 24" width="26" height="26">
          <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
