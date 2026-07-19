'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Clock, Phone, ChevronDown } from 'lucide-react';
import type { ChurchInfo, Locale } from '@/lib/types';
import { t, localePath, stripLocale } from '@/lib/i18n';
import { site } from '@/config/site';
import LiveButton from './LiveButton';
import LanguageSwitcher from './LanguageSwitcher';
import { YoutubeIcon, FacebookIcon, InstagramIcon } from './BrandIcons';
import styles from './Header.module.scss';

export type HeaderUtility = { serviceLine?: string; phone?: string };

type NavItem = { path?: string; label: string; exact?: boolean; children?: { path: string; label: string }[] };

export default function Header({
  churchInfo,
  utility,
  locale,
}: {
  churchInfo: ChurchInfo | null;
  utility?: HeaderUtility;
  locale: Locale;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [dropOpen, setDropOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const dict = t(locale);

  const logical = stripLocale(pathname);
  const NAV: NavItem[] = [
    { path: '/', label: dict.nav.home, exact: true },
    {
      label: dict.nav.about,
      children: [
        { path: '/despre', label: dict.nav.whoWeAre },
        { path: '/ce-credem', label: dict.nav.beliefs },
        { path: '/prima-vizita', label: dict.nav.firstVisit },
      ],
    },
    { path: '/program', label: dict.nav.schedule },
    { path: '/evenimente', label: dict.nav.events },
    { path: '/proiecte', label: dict.nav.projects },
    { path: '/blog', label: dict.nav.blog },
    { path: '/contact', label: dict.nav.contact },
  ];

  const isActive = (path: string, exact?: boolean) => (exact ? logical === path : logical.startsWith(path));
  const groupActive = (item: NavItem) => (item.children ?? []).some((c) => isActive(c.path));

  // O singură sondare a stării live pentru toată bara.
  useEffect(() => {
    let active = true;
    const check = () =>
      fetch('/api/live')
        .then((r) => r.json())
        .then((d) => active && setIsLive(!!d.isLive))
        .catch(() => {});
    check();
    const id = setInterval(check, 60000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Stare header la scroll — un singur listener, rAF, cu bandă moartă anti-flicker.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled((s) => (s ? y > 24 : y > 48));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Magic line — alunecă între itemele de nivel 1 (linkuri + declanșatorul de dropdown).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const items = Array.from(nav.querySelectorAll<HTMLElement>('[data-nav-item]'));
    const move = (el: HTMLElement) => {
      const nr = nav.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      nav.style.setProperty('--mx', `${r.left - nr.left + 16}px`);
      nav.style.setProperty('--ms', `${(r.width - 32) / 100}`);
      nav.style.setProperty('--mo', '1');
    };
    const toActive = () => {
      const a = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (a) move(a);
      else nav.style.setProperty('--mo', '0');
    };
    const enter = (e: Event) => move(e.currentTarget as HTMLElement);
    items.forEach((a) => a.addEventListener('mouseenter', enter));
    nav.addEventListener('mouseleave', toActive);
    window.addEventListener('resize', toActive, { passive: true });
    if (document.fonts?.ready) document.fonts.ready.then(toActive);
    else toActive();
    return () => {
      items.forEach((a) => a.removeEventListener('mouseenter', enter));
      nav.removeEventListener('mouseleave', toActive);
      window.removeEventListener('resize', toActive);
    };
  }, [pathname, locale]);

  // Blochează scroll-ul paginii când meniul mobil e deschis.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setDropOpen(null);
  }, [pathname]);

  const state = scrolled || open ? 'scrolled' : 'top';
  const logoAlt = churchInfo?.churchName || site.name.ro;

  return (
    <>
      <a href="#main-content" className={styles.skip}>
        {dict.header.skip}
      </a>

      <header className={`${styles.header} ${open ? styles.menuOpen : ''}`} data-state={state} role="banner">
        <div className={styles.shadowLayer} aria-hidden />

        {utility && (utility.serviceLine || utility.phone || isLive) && (
          <div className={styles.utilRow} aria-hidden={scrolled}>
            <div className={`container ${styles.inner}`}>
              <div className={styles.uLeft}>
                {isLive ? (
                  <Link href={localePath(locale, '/#live')} className={`${styles.uItem} ${styles.uLive}`}>
                    <span className={styles.uLiveDot} aria-hidden />
                    {dict.header.liveWatch}
                  </Link>
                ) : (
                  utility.serviceLine && (
                    <span className={styles.uItem}>
                      <Clock size={14} />
                      {utility.serviceLine}
                    </span>
                  )
                )}
              </div>
              {utility.phone && (
                <div className={styles.uRight}>
                  <a href={`tel:${utility.phone.replace(/\s/g, '')}`} className={styles.uItem}>
                    <Phone size={14} />
                    {utility.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.mainRow}>
          <div className={`container ${styles.inner}`}>
            <Link href={localePath(locale, '/')} className={styles.brand} aria-label={`${dict.header.homeAria} — ${logoAlt}`}>
              <span className={styles.brandName}>{site.brand.line1}</span>
              <span className={styles.brandPill}>{site.brand.line2}</span>
            </Link>

            <nav className={styles.nav} aria-label={dict.header.navMain} ref={navRef}>
              {NAV.map((n, i) =>
                n.children ? (
                  <div
                    key={n.label}
                    className={styles.dropdown}
                    style={{ '--i': i } as CSSProperties}
                    onMouseEnter={() => setDropOpen(n.label)}
                    onMouseLeave={() => setDropOpen(null)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropOpen(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setDropOpen(null);
                    }}
                  >
                    <button
                      type="button"
                      data-nav-item
                      className={styles.dropTrigger}
                      aria-haspopup="true"
                      aria-expanded={dropOpen === n.label}
                      aria-current={groupActive(n) ? 'page' : undefined}
                      onClick={() => setDropOpen((o) => (o === n.label ? null : n.label))}
                    >
                      {n.label}
                      <ChevronDown size={15} className={styles.dropChevron} aria-hidden />
                    </button>
                    <ul className={`${styles.dropPanel} ${dropOpen === n.label ? styles.dropShown : ''}`}>
                      {n.children.map((c) => (
                        <li key={c.path}>
                          <Link
                            href={localePath(locale, c.path)}
                            aria-current={isActive(c.path) ? 'page' : undefined}
                            onClick={() => setDropOpen(null)}
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    key={n.path}
                    href={localePath(locale, n.path!)}
                    data-nav-item
                    style={{ '--i': i } as CSSProperties}
                    aria-current={isActive(n.path!, n.exact) ? 'page' : undefined}
                  >
                    {n.label}
                  </Link>
                ),
              )}
              <span className={styles.magic} aria-hidden />
            </nav>

            <div className={styles.actions}>
              <LanguageSwitcher locale={locale} />
              {churchInfo?.youtubeChannelName && <LiveButton isLive={isLive} locale={locale} />}
              <button
                className={styles.burger}
                aria-label={open ? dict.header.closeMenu : dict.header.openMenu}
                aria-expanded={open}
                aria-controls="mobileMenu"
                onClick={() => setOpen((o) => !o)}
                type="button"
              >
                {open ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div id="mobileMenu" className={`${styles.mobileMenu} ${open ? styles.mobileOpen : ''}`} aria-hidden={!open}>
        <nav className={styles.mobileNav} aria-label={dict.header.navMobile}>
          {NAV.map((n, i) =>
            n.children ? (
              <div key={n.label} className={styles.mobileGroup} style={{ '--i': i } as CSSProperties}>
                <span className={styles.mobileGroupLabel}>{n.label}</span>
                {n.children.map((c) => (
                  <Link
                    key={c.path}
                    href={localePath(locale, c.path)}
                    className={styles.mobileSub}
                    aria-current={isActive(c.path) ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={n.path}
                href={localePath(locale, n.path!)}
                style={{ '--i': i } as CSSProperties}
                aria-current={isActive(n.path!, n.exact) ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ),
          )}
        </nav>
        {churchInfo && (
          <div className={styles.mobileFoot}>
            {churchInfo.youtubeLink && (
              <a href={churchInfo.youtubeLink} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <YoutubeIcon />
              </a>
            )}
            {churchInfo.facebookLink && (
              <a href={churchInfo.facebookLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon />
              </a>
            )}
            {churchInfo.instagramLink && (
              <a href={churchInfo.instagramLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
