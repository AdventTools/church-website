import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.scss';

function pageList(current: number, total: number): (number | '…')[] {
  const pages: (number | '…')[] = [];
  const w = 1;
  for (let p = 1; p <= total; p += 1) {
    if (p === 1 || p === total || (p >= current - w && p <= current + w)) pages.push(p);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return pages;
}

type Props = { current: number; total: number; hrefFor: (page: number) => string };

export default function Pagination({ current, total, hrefFor }: Props) {
  if (total <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Paginare">
      {current > 1 && (
        <Link href={hrefFor(current - 1)} className={styles.arrow} aria-label="Pagina anterioară">
          <ChevronLeft size={20} />
        </Link>
      )}
      {pageList(current, total).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            className={`${styles.page} ${p === current ? styles.current : ''}`}
            aria-current={p === current ? 'page' : undefined}
          >
            {p}
          </Link>
        ),
      )}
      {current < total && (
        <Link href={hrefFor(current + 1)} className={styles.arrow} aria-label="Pagina următoare">
          <ChevronRight size={20} />
        </Link>
      )}
    </nav>
  );
}
