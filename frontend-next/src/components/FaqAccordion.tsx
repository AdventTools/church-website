import { ChevronDown } from 'lucide-react';
import type { Faq } from '@/lib/types';
import styles from './FaqAccordion.module.scss';

// <details>/<summary>: accesibil nativ, conținut mereu în DOM (bun pentru SEO/AEO), funcționează și fără JS.
export default function FaqAccordion({ items }: { items: Faq[] }) {
  if (!items.length) return null;
  return (
    <div className={styles.list}>
      {items.map((f, i) => (
        <details key={i} className={styles.item} name="faq">
          <summary className={styles.q}>
            <span>{f.question}</span>
            <ChevronDown className={styles.chevron} size={20} aria-hidden />
          </summary>
          <div className={styles.a}>
            <p>{f.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
