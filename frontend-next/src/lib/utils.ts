import * as SunCalc from 'suncalc';
import type { Locale } from './types';
import { localePath } from './i18n';
import { site } from '@/config/site';

const toDate = (d: string | Date): Date => (d instanceof Date ? d : new Date(d));
const tag = (locale: Locale = 'ro'): string => (locale === 'en' ? 'en-GB' : 'ro-RO');

export function formatToLocalDate(date: string | Date, locale: Locale = 'ro'): string {
  return toDate(date)
    .toLocaleDateString(tag(locale), { day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/ \w/, (c) => c.toUpperCase());
}

export function formatToLocalDayName(date: string | Date, locale: Locale = 'ro'): string {
  return toDate(date)
    .toLocaleDateString(tag(locale), { weekday: 'long' })
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function formatToYYYYMMDD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** range(1, 5) => [1, 2, 3, 4, 5] */
export const range = (from: number, to: number, step = 1): number[] => {
  const out: number[] = [];
  for (let i = from; i <= to; i += step) out.push(i);
  return out;
};

export const getDayName = (dayNumber: number): string => {
  // 1 = Duminica ... 6 = Vineri, restul = Sambata
  const days = ['Sambata', 'Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri'];
  return days[dayNumber] ?? 'Sambata';
};

// Data următoarei zile date (ex. pentru 6 = următoarea vineri). Sâmbăta se tratează ca vineri.
export const getNextDate = (dayOfWeek: number): Date => {
  const date = new Date();
  if (date.getDay() === 6) date.setDate(date.getDate() - 1);
  date.setDate(date.getDate() + ((dayOfWeek + 6 - date.getDay()) % 7));
  return date;
};

// Ora apusului la locația bisericii (pentru începutul Sabatului). Coordonate din config/site.ts.
export const getSunsetForDay = (date: Date): string => {
  const sunset = SunCalc.getTimes(date, site.geo.lat, site.geo.lng).sunset;
  if (!sunset || Number.isNaN(sunset.getTime())) return '';
  const m = sunset.getMinutes();
  return `${sunset.getHours()}:${m < 10 ? '0' : ''}${m}`;
};

export const getFormattedPeriod = (start: string | Date, end: string | Date, locale: Locale = 'ro'): string => {
  const s = toDate(start);
  const e = toDate(end);
  const fs = formatToLocalDate(s, locale);
  const fe = formatToLocalDate(e, locale);

  if (fs === fe) return fs; // o singură zi
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) return `${s.getDate()} - ${fe}`;
  if (s.getFullYear() === e.getFullYear()) {
    const dayMonthStart = s
      .toLocaleDateString(tag(locale), { day: 'numeric', month: 'long' })
      .replace(/ \w/, (c) => c.toUpperCase());
    return `${dayMonthStart} - ${fe}`;
  }
  return `${fs} - ${fe}`;
};

export const slugify = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Segmentul de URL al unei pagini de detaliu: slug curat dacă există (ex. „amicus”),
// altfel forma veche „{id}-{titlu}” (compatibilitate pentru conținut fără slug).
type Sluggable = { id: number; title: string; slug?: string };
export const detailSeg = (e: Sluggable): string => e.slug || `${e.id}-${slugify(e.title)}`;

export const projectHref = (e: Sluggable, locale: Locale = 'ro'): string => localePath(locale, `/proiecte/${detailSeg(e)}`);
export const eventHref = (e: Sluggable, locale: Locale = 'ro'): string => localePath(locale, `/evenimente/${detailSeg(e)}`);
export const articleHref = (e: Sluggable, locale: Locale = 'ro'): string => localePath(locale, `/blog/${detailSeg(e)}`);

// Din segmentul de URL: dacă începe cu cifre e forma veche → întoarce id-ul (pentru redirect 301).
export const parseEventId = (idAndTitle: string): string => idAndTitle.split('-')[0];
export const legacyId = (seg: string): string | null => (/^\d/.test(seg) ? seg.split('-')[0] : null);

// Un eveniment merită pagină proprie (e clickabil) doar dacă are ceva ÎN PLUS față de listă:
// rezumat, descriere reală (nu doar titlul repetat), imagine, locație sau link Facebook.
export const hasEventDetail = (e: {
  intro?: string;
  content?: string;
  title: string;
  smallImg?: string;
  largeImg?: string;
  locationName?: string;
  facebookLink?: string;
}): boolean => {
  const norm = (s?: string) => (s || '').replace(/\s+/g, ' ').trim();
  return !!(
    norm(e.intro) ||
    (norm(e.content) && norm(e.content) !== norm(e.title)) ||
    e.smallImg ||
    e.largeImg ||
    e.locationName ||
    e.facebookLink
  );
};

export const summarize = (text: string, max = 160): string => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
};
