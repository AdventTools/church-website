'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { GalleryImage, Locale } from '@/lib/types';
import { t } from '@/lib/i18n';
import styles from './Gallery.module.scss';

// Miniaturile vin gata redimensionate din Strapi (small ~500px) → <img> simplu, rapid, fără re-encodare.
export default function Gallery({ images, locale = 'ro' }: { images: GalleryImage[]; locale?: Locale }) {
  const a11y = t(locale).a11y;
  const [index, setIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const [mounted, setMounted] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setIndex(null);
    setZoom(false);
  }, []);
  const prev = useCallback(() => {
    setZoom(false);
    setIndex((i) => (i === null ? null : (i + images.length - 1) % images.length));
  }, [images.length]);
  const next = useCallback(() => {
    setZoom(false);
    setIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, close, prev, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || zoom) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 50) prev();
    else if (dx < -50) next();
    touchX.current = null;
  };

  const active = index === null ? null : images[index];

  return (
    <>
      <div className={styles.grid}>
        {images.map((img, i) => (
          <button
            key={img.id}
            className={styles.thumb}
            onClick={() => setIndex(i)}
            type="button"
            aria-label={`${a11y.openPhoto} ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.small || img.large}
              alt={img.alt}
              width={img.width}
              height={img.height}
              loading="lazy"
              decoding="async"
            />
            <span className={styles.thumbOverlay} aria-hidden>
              <ZoomIn size={22} />
            </span>
          </button>
        ))}
      </div>

      {active &&
        mounted &&
        createPortal(
          <div
            className={styles.lightbox}
            onClick={close}
            role="dialog"
            aria-modal="true"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
          <span className={styles.counter}>
            {index! + 1} / {images.length}
          </span>
          <button className={styles.close} onClick={close} type="button" aria-label={a11y.close}>
            <X size={28} />
          </button>
          <button
            className={`${styles.nav} ${styles.prev}`}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            type="button"
            aria-label={a11y.prevPhoto}
          >
            <ChevronLeft size={36} />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`${styles.full} ${zoom ? styles.zoomed : ''}`}
            src={active.large || active.small}
            alt={active.alt}
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => !z);
            }}
          />

          <button
            className={`${styles.nav} ${styles.next}`}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            type="button"
            aria-label={a11y.nextPhoto}
          >
            <ChevronRight size={36} />
          </button>
          </div>,
          document.body,
        )}
    </>
  );
}
