'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { stripLocale, localePath, t } from '@/lib/i18n';
import { LOCALES, type Locale } from '@/lib/types';
import styles from './Header.module.scss';

// Comută limba păstrând pagina curentă (RO ⇄ EN).
export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const logical = stripLocale(pathname);
  return (
    <div className={styles.lang} role="group" aria-label={t(locale).header.langGroup}>
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={localePath(code, logical)}
          hrefLang={code}
          className={code === locale ? styles.langActive : styles.langItem}
          aria-current={code === locale ? 'true' : undefined}
        >
          {code.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
