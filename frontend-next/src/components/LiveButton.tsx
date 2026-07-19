import styles from './Header.module.scss';
import { t, localePath } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

// Ancoră reală (nu next/link) ca să deruleze fiabil la secțiunea de pe prima pagină.
// Live → playerul live (#live); altfel → „Transmisiuni recente" (#predici).
export default function LiveButton({ isLive, locale }: { isLive: boolean; locale: Locale }) {
  const dict = t(locale);
  return (
    <a
      href={isLive ? localePath(locale, '/#live') : localePath(locale, '/#predici')}
      className={styles.liveBtn}
      data-live={isLive}
      aria-label={isLive ? dict.header.liveAriaWatch : dict.header.liveAriaRecent}
    >
      <span className={styles.dot} aria-hidden />
      {isLive ? dict.header.liveNow : dict.header.live}
    </a>
  );
}
