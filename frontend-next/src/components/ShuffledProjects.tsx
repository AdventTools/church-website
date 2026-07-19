'use client';

import { useState, useEffect } from 'react';
import Reveal from './Reveal';
import ProjectCard from './ProjectCard';
import type { Project, Locale } from '@/lib/types';
import styles from './ShuffledProjects.module.scss';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Afișează proiectele în ordine ALEATOARE la fiecare încărcare — niciun proiect nu e prioritizat.
// `limit` (opțional) => arată doar câte proiecte (ex. 3 pe prima pagină), tot aleator.
export default function ShuffledProjects({ projects, locale, limit }: { projects: Project[]; locale: Locale; limit?: number }) {
  const [order, setOrder] = useState(projects);

  useEffect(() => {
    setOrder(shuffle(projects));
  }, [projects]);

  const shown = limit ? order.slice(0, limit) : order;

  return (
    <div className={styles.grid}>
      {shown.map((p, i) => (
        <Reveal key={p.id} delay={i * 60}>
          <ProjectCard project={p} locale={locale} />
        </Reveal>
      ))}
    </div>
  );
}
