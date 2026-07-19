import type { ReactNode } from 'react';
import Link from 'next/link';
import Reveal from './Reveal';
import styles from './Section.module.scss';

type Props = {
  title?: string;
  children: ReactNode;
  cta?: { href: string; label: string };
  className?: string;
  id?: string;
};

export default function Section({ title, children, cta, className, id }: Props) {
  return (
    <section id={id} className={`${styles.section} ${className ?? ''}`}>
      <div className="container">
        <Reveal>
          {title && <h2 className={styles.title}>{title}</h2>}
          {children}
          {cta && (
            <Link href={cta.href} className={`btn ${styles.cta}`}>
              {cta.label}
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
