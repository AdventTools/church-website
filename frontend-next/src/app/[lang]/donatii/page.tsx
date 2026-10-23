import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Info } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import CopyField from '@/components/CopyField';
import JsonLd from '@/components/JsonLd';
import { getDonation, getChurchInfo, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata, siteName } from '@/lib/seo';
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './donatii.module.scss';

export const revalidate = 60;

const PATH = '/donatii';

// IBAN-ul se citește și se dictează în grupuri de câte 4; se copiază fără spații.
const groupIban = (iban: string) => iban.replace(/(.{4})(?=.)/g, '$1 ');

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const [donation, info] = await Promise.all([getDonation(locale), getChurchInfo(locale)]);
  if (!donation) return { robots: { index: false, follow: false } };
  const church = info?.churchName || siteName(locale);
  return pageMetadata({ locale, title: dict.donations.title, description: dict.donations.meta(church), path: PATH });
}

export default async function DonatiiPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const d = dict.donations;

  const [donation, info, bg] = await Promise.all([getDonation(locale), getChurchInfo(locale), getBackgroundImages()]);
  if (!donation) notFound();

  const church = info?.churchName || siteName(locale);
  const path = localePath(locale, PATH);
  const copyProps = { copy: d.copy, copied: d.copied, copyFailed: d.copyFailed };
  const destination = (
    <p className={styles.destination}>
      <Info size={20} aria-hidden className={styles.destinationIcon} />
      <span className="speakable">{d.destination}</span>
    </p>
  );

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'WebPage', name: d.title, path, description: d.meta(church), locale, speakable: true }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: d.title, path },
          ]),
          faqJsonLd([
            {
              q: d.question(church),
              a: d.answer({ church, beneficiary: donation.beneficiary, iban: donation.iban, bank: donation.bank, details: donation.paymentDetails }),
            },
          ]),
        ]}
      />

      <PageHeader title={d.title} image={bg.home} />

      <section className={styles.page}>
        <div className={`container ${styles.inner}`}>
          <div className={styles.intro}>
            <p className={styles.church}>{church}</p>
            {donation.thankYou && <p className={`${styles.thanks} speakable`}>{donation.thankYou}</p>}
          </div>

          <div className={styles.card}>
            {donation.beneficiary && (
              <CopyField label={d.beneficiary} value={donation.beneficiary} copyLabel={d.copyLabel(d.beneficiary)} {...copyProps} />
            )}
            <CopyField label={d.iban} value={donation.iban} display={groupIban(donation.iban)} mono copyLabel={d.copyLabel(d.iban)} {...copyProps} />
            {donation.paymentDetails ? (
              <CopyField label={d.details} value={donation.paymentDetails} copyLabel={d.copyLabel(d.details)} {...copyProps}>
                {destination}
              </CopyField>
            ) : (
              <div className={styles.plainField}>
                <p className={styles.plainLabel}>{d.details}</p>
                {destination}
              </div>
            )}

            {(donation.bank || donation.currency) && (
              <dl className={styles.facts}>
                {donation.bank && (
                  <div>
                    <dt>{d.bank}</dt>
                    <dd>{donation.bank}</dd>
                  </div>
                )}
                {donation.currency && (
                  <div>
                    <dt>{d.currency}</dt>
                    <dd>{donation.currency}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          <div className={styles.how}>
            <h2>{d.howTitle}</h2>
            <ol className={styles.steps}>
              {d.steps.map((s, i) => (
                <li key={i}>
                  <span className={styles.stepNum} aria-hidden>
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
