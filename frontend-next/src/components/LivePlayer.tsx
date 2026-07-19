'use client';

import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import styles from './LivePlayer.module.scss';

type LiveState = { isLive: boolean; videoId?: string; title?: string };

// Apare pe prima pagină DOAR când canalul e live: banner + player încorporat (rămâi pe site).
export default function LivePlayer() {
  const [live, setLive] = useState<LiveState>({ isLive: false });

  useEffect(() => {
    let active = true;
    const check = () =>
      fetch('/api/live')
        .then((r) => r.json())
        .then((d) => active && setLive(d))
        .catch(() => {});
    check();
    const id = setInterval(check, 60000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!live.isLive || !live.videoId) return null;

  return (
    <section id="live" className={styles.wrap}>
      <div className="container">
        <div className={styles.badge}>
          <Radio size={18} />
          <span>ÎN DIRECT ACUM</span>
        </div>
        {live.title && <h2 className={styles.title}>{live.title}</h2>}
        <div className={styles.frame}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${live.videoId}?autoplay=1&mute=1&rel=0`}
            title={live.title || 'Transmisiune în direct'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
