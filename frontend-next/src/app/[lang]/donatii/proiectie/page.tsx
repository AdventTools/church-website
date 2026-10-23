import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import AdventistSymbol from '@/components/AdventistSymbol';
import ProjectionStage from '@/components/ProjectionStage';
import { getDonation } from '@/lib/strapi';
import { SITE_URL, siteName } from '@/lib/seo';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './proiectie.module.scss';

// Slide 16:9 proiectat în sală (colectă, anunțuri): QR către /donatii, opțional bugetul anunțat
// prin `?scop=...`. Nu e o pagină de citit, deci nu se indexează și nu intră în sitemap.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const groupIban = (iban: string) => iban.replace(/(.{4})(?=.)/g, '$1 ');

export default async function ProiectiePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ scop?: string | string[] }>;
}) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const p = t(locale).donations.projection;

  const donation = await getDonation(locale);
  if (!donation) notFound();

  const raw = Array.isArray(query.scop) ? query.scop[0] : query.scop;
  const purpose = raw?.trim().replace(/\s+/g, ' ').slice(0, 60) || '';

  const url = `${SITE_URL}${localePath(locale, '/donatii')}`;
  const qr = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#111316', light: '#ffffff' } });

  return (
    <ProjectionStage className={styles.stage} hint={p.fullscreen}>
      <div className={styles.qrCard}>
        <div className={styles.qr} dangerouslySetInnerHTML={{ __html: qr }} />
        <p className={styles.scan}>{p.scan}</p>
      </div>

      <div className={styles.text}>
        <p className={styles.brand}>
          <AdventistSymbol className={styles.symbol} />
          <span>{siteName(locale)}</span>
        </p>

        <div>
          <p className={styles.eyebrow}>{purpose ? p.purposeEyebrow : p.eyebrow}</p>
          <h1 className={styles.title}>{purpose || p.title}</h1>
          <p className={styles.sub}>{purpose ? p.writeIn(purpose) : p.sub}</p>
        </div>

        <div className={styles.foot}>
          <p className={styles.url}>{url.replace(/^https?:\/\//, '')}</p>
          <p className={styles.iban}>
            <span>IBAN</span> {groupIban(donation.iban)}
          </p>
        </div>
      </div>
    </ProjectionStage>
  );
}
