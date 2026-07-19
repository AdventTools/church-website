import { getDayName, getNextDate, getSunsetForDay, formatToLocalDayName } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Program, Locale } from '@/lib/types';
import styles from './ProgramDay.module.scss';

export default function ProgramDay({
  dayNumber,
  programs,
  locale = 'ro',
  headingLevel = 'h3',
}: {
  dayNumber: number;
  programs: Program[];
  locale?: Locale;
  headingLevel?: 'h2' | 'h3';
}) {
  const dayName = getDayName(dayNumber);
  const items = programs.filter((p) => p.day === dayName).sort((a, b) => a.time.localeCompare(b.time));
  if (!items.length) return null;

  const date = getNextDate(dayNumber);
  const sunset = dayNumber >= 6 ? getSunsetForDay(date) : '';
  const Heading = headingLevel;

  return (
    <div className={styles.day}>
      <Heading className={styles.name}>{formatToLocalDayName(date, locale)}</Heading>
      {sunset && (
        <p className={styles.sunset}>
          {t(locale).schedule.sunset} {sunset}
        </p>
      )}
      <ul className={styles.list}>
        {items.map((p) => (
          <li key={p.id}>
            <span className={styles.time}>{p.time}</span>
            <span className={styles.label}>
              {p.name}
              {p.live && <span className={styles.live}>LIVE</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
