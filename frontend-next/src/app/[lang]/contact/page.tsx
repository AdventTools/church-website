import type { Metadata } from 'next';
import { MapPin, Phone, Mail, User } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import ContactForm from '@/components/ContactForm';
import JsonLd from '@/components/JsonLd';
import { getContact, getBackgroundImages } from '@/lib/strapi';
import { pageMetadata, SITE_URL, SITE_NAME } from '@/lib/seo';
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './contact.module.scss';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  return pageMetadata({ locale, title: dict.contact.title, description: dict.contact.meta, path: '/contact' });
}

// Extrage doar URL-ul din câmpul de hartă. Acceptă fie un iframe complet (folosește src),
// fie doar URL-ul; taie orice atribut/HTML lipit după el (ex. `" width="800"`).
function extractMapSrc(raw?: string): string | null {
  if (!raw) return null;
  const m = raw.match(/src=["']([^"']+)["']/i);
  const url = (m ? m[1] : raw).trim().split(/["'\s<>]/)[0];
  return /^https:\/\//i.test(url) ? url : null;
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);

  const [contact, bg] = await Promise.all([getContact(locale), getBackgroundImages()]);
  const mapSrc = extractMapSrc(contact?.mapsIframeSrc);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ type: 'ContactPage', name: dict.contact.title, path: localePath(locale, '/contact'), description: dict.contact.meta, locale }),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.contact.title, path: localePath(locale, '/contact') },
          ]),
          ...(contact?.pastor
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'Person',
                  name: contact.pastor,
                  jobTitle: 'Pastor',
                  worksFor: { '@type': 'Church', '@id': `${SITE_URL}/#church`, name: SITE_NAME },
                },
              ]
            : []),
        ]}
      />
      <PageHeader title={dict.contact.title} image={bg.contact || bg.home} />
      <Section>
        <div className={styles.grid}>
          <div className={styles.details}>
            <h2 className={styles.h}>{dict.contact.details}</h2>
            {contact?.pastor && (
              <p className={styles.line}>
                <User size={18} /> <strong>{dict.contact.pastor}:</strong> {contact.pastor}
              </p>
            )}
            {contact?.phone && (
              <p className={styles.line}>
                <Phone size={18} /> <strong>{dict.contact.phone}:</strong> <a href={`tel:${contact.phone}`}>{contact.phone}</a>
              </p>
            )}
            {contact?.email && (
              <p className={styles.line}>
                <Mail size={18} /> <strong>{dict.contact.email}:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            )}
            {contact?.address && (
              <p className={styles.line}>
                <MapPin size={18} /> <strong>{dict.contact.address}:</strong> {contact.address}
              </p>
            )}
          </div>
          <div>
            <h2 className={styles.h}>{dict.contact.formTitle}</h2>
            <ContactForm locale={locale} />
          </div>
        </div>

        {mapSrc && (
          <iframe
            className={styles.map}
            src={mapSrc}
            height={432}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={locale === 'en' ? 'Map' : 'Hartă'}
          />
        )}
      </Section>
    </>
  );
}
