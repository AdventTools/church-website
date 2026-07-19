'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, ChevronDown } from 'lucide-react';
import { t } from '@/lib/i18n';
import Gallery from './Gallery';
import type { Ensemble, ProjectVideo, Locale } from '@/lib/types';
import styles from './ProjectSections.module.scss';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fiecare secțiune de proiect: titlu + descriere + (opțional) persoane, videouri (2 aleator + „vezi mai multe”)
// și galerie foto. Universal — merge la orice proiect (formații muzicale, galerii, filmări etc.).
export default function ProjectSections({ sections, locale }: { sections: Ensemble[]; locale: Locale }) {
  const dict = t(locale).music;
  const [videos, setVideos] = useState<Record<number, ProjectVideo[]>>(() =>
    Object.fromEntries(sections.map((e, i) => [i, e.videos])),
  );
  const [people, setPeople] = useState<Record<number, string[]>>(() =>
    Object.fromEntries(sections.map((e, i) => [i, e.conductors])),
  );
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    setVideos(Object.fromEntries(sections.map((e, i) => [i, shuffle(e.videos)])));
    setPeople(Object.fromEntries(sections.map((e, i) => [i, shuffle(e.conductors)])));
  }, [sections]);

  if (!sections.length) return null;
  const peopleFallback = locale === 'en' ? 'People' : 'Persoane';

  return (
    <div className={styles.wrap}>
      {sections.map((e, i) => {
        const evs = videos[i] ?? e.videos;
        const ppl = people[i] ?? e.conductors;
        const hasContent = evs.length || e.images.length || ppl.length || e.description;
        if (!hasContent) return null;
        const shown = expanded[i] ? evs : evs.slice(0, 2);
        return (
          <section key={i} className={styles.section} aria-label={e.name}>
            <h2 className={styles.name}>{e.name}</h2>
            {e.description && <p className={styles.desc}>{e.description}</p>}
            {ppl.length > 0 && (
              <p className={styles.people}>
                <span className={styles.peopleLabel}>{(e.peopleLabel || peopleFallback) + ':'}</span> {ppl.join(' · ')}
              </p>
            )}

            {shown.length > 0 && (
              <div className={styles.grid}>
                {shown.map((v) => (
                  <div key={v.id} className={styles.card}>
                    {active === v.id ? (
                      <iframe
                        className={styles.frame}
                        src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                        title={v.title || e.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <button
                        type="button"
                        className={styles.thumb}
                        onClick={() => setActive(v.id)}
                        aria-label={`${dict.play} — ${v.title || e.name}`}
                      >
                        <Image src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 700px) 100vw, 360px" />
                        <span className={styles.play} aria-hidden>
                          <Play size={26} fill="currentColor" />
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {evs.length > 2 && (
              <button
                type="button"
                className={styles.moreBtn}
                onClick={() => setExpanded((p) => ({ ...p, [i]: !p[i] }))}
                aria-expanded={!!expanded[i]}
              >
                {expanded[i] ? dict.less : `${dict.more} (${evs.length - 2})`}
                <ChevronDown size={18} className={expanded[i] ? styles.chevOpen : styles.chev} aria-hidden />
              </button>
            )}

            {e.images.length > 0 && (
              <div className={styles.gallery}>
                <Gallery images={e.images} locale={locale} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
