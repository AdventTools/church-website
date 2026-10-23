'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from './ProjectionStage.module.scss';

function toggle() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

// Ecran întreg peste antet și footer; un click (sau tasta F) comută modul fullscreen al browserului.
export default function ProjectionStage({ className, hint, children }: { className?: string; hint: string; children: ReactNode }) {
  const [full, setFull] = useState(false);

  useEffect(() => {
    const onChange = () => setFull(Boolean(document.fullscreenElement));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') toggle();
    };
    document.addEventListener('fullscreenchange', onChange);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className={`${styles.stage} ${full ? styles.full : ''} ${className ?? ''}`} onClick={toggle}>
      {children}
      <p className={styles.hint}>{hint}</p>
    </div>
  );
}
