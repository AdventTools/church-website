import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { YoutubeIcon, FacebookIcon, InstagramIcon } from './BrandIcons';
import type { ChurchInfo, Locale } from '@/lib/types';
import { t, localePath } from '@/lib/i18n';
import { site, siteSlogan } from '@/config/site';
import styles from './Footer.module.scss';

const EXTERNAL = site.footerLinks;

export default function Footer({ churchInfo, locale }: { churchInfo: ChurchInfo | null; locale: Locale }) {
  const year = new Date().getFullYear();
  const dict = t(locale);
  const tagline = siteSlogan(locale);
  const name = churchInfo?.churchName || site.name.ro;

  const INTERNAL = [
    { href: localePath(locale, '/despre'), label: dict.nav.whoWeAre },
    { href: localePath(locale, '/ce-credem'), label: dict.nav.beliefs },
    { href: localePath(locale, '/prima-vizita'), label: dict.nav.firstVisit },
    { href: localePath(locale, '/program'), label: dict.nav.schedule },
    { href: localePath(locale, '/evenimente'), label: dict.nav.events },
    { href: localePath(locale, '/proiecte'), label: dict.nav.projects },
    { href: localePath(locale, '/blog'), label: dict.nav.blog },
    { href: localePath(locale, '/contact'), label: dict.nav.contact },
  ];

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <p className={styles.fname}>{name}</p>
          <p className={styles.tagline}>{tagline}</p>
          {churchInfo?.address && (
            <a
              className={styles.addr}
              href={churchInfo.locationMapLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={16} aria-hidden /> {churchInfo.address}
            </a>
          )}
          <div className={styles.social}>
            {churchInfo?.youtubeLink && (
              <a href={churchInfo.youtubeLink} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <YoutubeIcon size={18} />
              </a>
            )}
            {churchInfo?.facebookLink && (
              <a href={churchInfo.facebookLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon size={18} />
              </a>
            )}
            {churchInfo?.instagramLink && (
              <a href={churchInfo.instagramLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
            )}
          </div>
        </div>

        <nav className={styles.links} aria-label={dict.footer.nav}>
          <p className={styles.heading}>{dict.footer.nav}</p>
          <ul>
            {INTERNAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.links} aria-label={dict.footer.useful}>
          <p className={styles.heading}>{dict.footer.useful}</p>
          <ul>
            {EXTERNAL.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.copyright}>
        <div className={`container ${styles.copyInner}`}>
          <span>© {year} {name}</span>
          <span className={styles.slogan}>{tagline}</span>
        </div>
      </div>
    </footer>
  );
}
