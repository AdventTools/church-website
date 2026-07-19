import qs from 'qs';
import type {
  ChurchInfo,
  Style,
  BackgroundImages,
  HomePage,
  Contact,
  HistoryEntry,
  Gallery,
  Program,
  ChurchEvent,
  FirstVisit,
  Project,
  Article,
  Beliefs,
  Locale,
} from './types';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://127.0.0.1:1337';

export const EVENT_CAROUSEL_LIMIT = 7;
export const PAGE_SIZE = 5;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StrapiEntry = { id: number; attributes: any };

// Adaugă ?locale=xx la un path (respectă separatorul existent).
function loc(path: string, locale?: Locale): string {
  if (!locale) return path;
  return `${path}${path.includes('?') ? '&' : '?'}locale=${locale}`;
}

async function api<T>(path: string, opts?: { revalidate?: number; noStore?: boolean }): Promise<T | null> {
  try {
    const res = await fetch(`${STRAPI_URL}/api${path}`, {
      ...(opts?.noStore ? { cache: 'no-store' } : { next: { revalidate: opts?.revalidate ?? 60 } }),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Câmp media Strapi v4 -> url relativ (/uploads/..), servit same-origin prin rewrite-ul din next.config.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mediaUrl(field: any): string {
  return field?.data?.attributes?.url ?? '';
}

// Media multiplă -> listă de imagini (folosit la galerie + secțiuni de proiect).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapImages(data: any[], fallbackAlt: string) {
  return (data ?? []).map((img) => {
    const at = img.attributes;
    const thumb = at.formats?.small ?? at.formats?.medium ?? at;
    return {
      id: img.id,
      large: at.formats?.large?.url ?? at.url ?? '',
      small: at.formats?.small?.url ?? at.url ?? '',
      width: thumb.width ?? at.width ?? 800,
      height: thumb.height ?? at.height ?? 600,
      alt: at.alternativeText || fallbackAlt,
    };
  });
}

// Unește două liste (limba cerută + cealaltă) PER ELEMENT: ține versiunea în limba cerută dacă
// există, altfel pe cea din cealaltă limbă. Grupurile se identifică prin `localizations`.
function mergeLocalized(primary: StrapiEntry[], fallback: StrapiEntry[]): StrapiEntry[] {
  const seen = new Set<number>();
  const out: StrapiEntry[] = [];
  const mark = (e: StrapiEntry) => {
    seen.add(e.id);
    (e.attributes.localizations?.data ?? []).forEach((l: { id: number }) => seen.add(l.id));
  };
  for (const e of primary) {
    out.push(e);
    mark(e);
  }
  for (const e of fallback) {
    const locIds = (e.attributes.localizations?.data ?? []).map((l: { id: number }) => l.id);
    if (seen.has(e.id) || locIds.some((id: number) => seen.has(id))) continue;
    out.push(e);
    mark(e);
  }
  return out;
}

// Preia o listă cu fallback pe limba cealaltă la nivel de element (conținutul completat doar
// într-o limbă apare și în cealaltă). `path` include query-ul, dar NU și locale-ul. Necesită
// `populate` cu `localizations`.
async function fetchListMerged(path: string, locale?: Locale): Promise<StrapiEntry[]> {
  const primary = (await api<{ data: StrapiEntry[] }>(loc(path, locale)))?.data ?? [];
  if (!locale) return primary;
  const other: Locale = locale === 'en' ? 'ro' : 'en';
  const fallback = (await api<{ data: StrapiEntry[] }>(loc(path, other)))?.data ?? [];
  return mergeLocalized(primary, fallback);
}

export async function getChurchInfo(locale?: Locale): Promise<ChurchInfo | null> {
  let res = await api<{ data: StrapiEntry | null }>(loc('/church-info?populate=*', locale));
  if (!res?.data && locale && locale !== 'ro') res = await api('/church-info?populate=*');
  const a = res?.data?.attributes;
  if (!a) return null;
  return {
    tabTitle: a.tabTitle ?? '',
    faviconUrl: mediaUrl(a.favicon),
    description: a.description ?? '',
    churchName: a.churchName ?? '',
    nameLogoUrl: mediaUrl(a.nameLogo),
    address: a.address ?? '',
    locationMapLink: a.locationMapLink ?? undefined,
    youtubeLink: a.youtubeLink ?? undefined,
    youtubeChannelName: a.youtubeChannelName ?? undefined,
    facebookLink: a.facebookLink ?? undefined,
    instagramLink: a.instagramLink ?? undefined,
  };
}

export async function getStyle(): Promise<Style | null> {
  const res = await api<{ data: { attributes: Style } | null }>('/style');
  return res?.data?.attributes ?? null;
}

export async function getBackgroundImages(): Promise<BackgroundImages> {
  const res = await api<{ data: StrapiEntry | null }>('/background?populate=*');
  const a = res?.data?.attributes;
  return {
    home: mediaUrl(a?.home),
    program: mediaUrl(a?.program) || undefined,
    contact: mediaUrl(a?.contact) || undefined,
  };
}

export async function getHomePage(locale?: Locale): Promise<HomePage | null> {
  let res = await api<{ data: StrapiEntry | null }>(loc('/home-page?populate=values', locale));
  if (!res?.data && locale && locale !== 'ro') res = await api('/home-page?populate=values');
  const a = res?.data?.attributes;
  if (!a) return null;
  return {
    title: a.title ?? '',
    aboutUs: a.aboutUs ?? '',
    description: a.description ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: (a.values ?? []).map((v: any) => ({ icon: v.icon ?? 'hope', title: v.title, text: v.text })),
  };
}

export async function getContact(locale?: Locale): Promise<Contact | null> {
  let res = await api<{ data: { attributes: Contact } | null }>(loc('/contact', locale));
  if (!res?.data && locale && locale !== 'ro') res = await api('/contact');
  return res?.data?.attributes ?? null;
}

export async function getHistory(locale?: Locale): Promise<HistoryEntry[]> {
  const query = qs.stringify({ sort: ['order:asc', 'id:asc'], populate: { localizations: true } }, { encodeValuesOnly: true });
  const rows = await fetchListMerged(`/histories?${query}`, locale);
  return rows
    .map((e) => ({ id: e.id, period: e.attributes.period, description: e.attributes.description, order: e.attributes.order ?? 0 }))
    .sort((a, b) => a.order - b.order || a.id - b.id)
    .map((e) => ({ id: e.id, period: e.period, description: e.description }));
}

export async function getGallery(locale?: Locale): Promise<Gallery> {
  let res = await api<{ data: StrapiEntry | null }>(loc('/gallery?populate=*', locale));
  if (!res?.data && locale && locale !== 'ro') res = await api('/gallery?populate=*');
  const a = res?.data?.attributes;
  if (!a) return { description: '', images: [] };
  const fallbackAlt =
    locale === 'en'
      ? 'A photo from the life of the Speranța Adventist community in Cluj-Napoca'
      : 'Fotografie din viața comunității Adventiste „Speranța” Cluj-Napoca';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images = (a.images?.data ?? []).map((img: any) => {
    const at = img.attributes;
    const thumb = at.formats?.small ?? at.formats?.medium ?? at;
    return {
      id: img.id,
      large: at.formats?.large?.url ?? at.url ?? '',
      small: at.formats?.small?.url ?? at.url ?? '',
      width: thumb.width ?? at.width ?? 800,
      height: thumb.height ?? at.height ?? 600,
      alt: at.alternativeText || fallbackAlt,
    };
  });
  return { description: a.description ?? '', images };
}

export async function getPrograms(locale?: Locale): Promise<Program[]> {
  const today = new Date().toISOString().slice(0, 10);
  const query = qs.stringify(
    { filters: { $or: [{ expirationDate: { $gte: today } }, { expirationDate: { $null: true } }] }, populate: { localizations: true } },
    { encodeValuesOnly: true },
  );
  const rows = await fetchListMerged(`/programs?${query}`, locale);
  return rows.map((p) => ({ id: p.id, ...p.attributes }));
}

export async function getFirstVisit(locale?: Locale): Promise<FirstVisit | null> {
  const query = qs.stringify({ populate: ['highlights', 'faqs'] }, { encodeValuesOnly: true });
  let res = await api<{ data: StrapiEntry | null }>(loc(`/first-visit?${query}`, locale));
  if (!res?.data && locale && locale !== 'ro') res = await api(`/first-visit?${query}`);
  const a = res?.data?.attributes;
  if (!a) return null;
  return {
    title: a.title ?? 'Prima ta vizită',
    subtitle: a.subtitle ?? undefined,
    intro: a.intro ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    highlights: (a.highlights ?? []).map((h: any) => ({ icon: h.icon ?? 'welcome', title: h.title, text: h.text })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    faqs: (a.faqs ?? []).map((f: any) => ({ question: f.question, answer: f.answer })),
    closingTitle: a.closingTitle ?? undefined,
    closingText: a.closingText ?? undefined,
  };
}

export async function getBeliefs(locale?: Locale): Promise<Beliefs | null> {
  let res = await api<{ data: { attributes: Beliefs } | null }>(loc('/beliefs', locale));
  if (!res?.data && locale && locale !== 'ro') res = await api('/beliefs');
  const a = res?.data?.attributes;
  if (!a) return null;
  return { title: a.title ?? 'Ce credem', intro: a.intro ?? undefined, content: a.content ?? '' };
}

export async function getUnderConstruction(): Promise<boolean> {
  const res = await api<{ data: { attributes: { Enabled: boolean } } | null }>('/under-construction', {
    revalidate: 60,
  });
  return res?.data?.attributes?.Enabled ?? false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildEvent(id: number, a: any): ChurchEvent {
  const cover = a.cover?.data?.attributes;
  const large = cover?.formats?.large ?? cover;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loc = (a.localizations?.data ?? [])[0];
  const alt = loc
    ? { id: loc.id, title: loc.attributes.title, locale: loc.attributes.locale as 'ro' | 'en', slug: loc.attributes.slug ?? undefined }
    : undefined;
  return {
    id,
    title: a.title,
    slug: a.slug ?? undefined,
    startDate: a.startDate,
    endDate: a.endDate,
    smallImg: cover?.formats?.small?.url ?? cover?.url ?? '',
    largeImg: cover?.formats?.large?.url ?? cover?.url ?? '',
    imgWidth: large?.width ?? undefined,
    imgHeight: large?.height ?? undefined,
    intro: a.intro ?? '',
    content: a.content ?? '',
    facebookLink: a.facebookLink ?? undefined,
    locationName: a.locationName ?? undefined,
    locationAddress: a.locationAddress ?? undefined,
    locationMapLink: a.locationMapLink ?? undefined,
    locale: (a.locale as 'ro' | 'en') ?? undefined,
    alt,
  };
}

// Extrage id-ul YouTube dintr-un URL (watch?v=, youtu.be/, embed/).
function ytId(url: string): string {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProject(id: number, a: any): Project {
  const cover = a.cover?.data?.attributes;
  const large = cover?.formats?.large ?? cover;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locz = (a.localizations?.data ?? [])[0];
  const ensembles = (
    (a.ensembles ?? []) as {
      name?: string;
      description?: string;
      peopleLabel?: string;
      conductors?: { name?: string }[];
      videos?: { url?: string; title?: string }[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      images?: { data?: any[] };
    }[]
  ).map((e) => ({
    name: e.name ?? '',
    description: e.description ?? undefined,
    peopleLabel: e.peopleLabel ?? undefined,
    conductors: (e.conductors ?? []).map((c) => c.name ?? '').filter(Boolean),
    videos: (e.videos ?? [])
      .map((v) => ({ id: ytId(v.url ?? ''), title: v.title ?? undefined }))
      .filter((v) => v.id),
    images: mapImages(e.images?.data ?? [], e.name ?? ''),
  }));
  return {
    ensembles,
    id,
    title: a.title,
    slug: a.slug ?? undefined,
    summary: a.summary ?? '',
    content: a.content ?? '',
    coverSmall: cover?.formats?.medium?.url ?? cover?.formats?.small?.url ?? cover?.url ?? '',
    coverLarge: cover?.formats?.large?.url ?? cover?.url ?? '',
    coverWidth: large?.width ?? undefined,
    coverHeight: large?.height ?? undefined,
    externalUrl: a.externalUrl ?? undefined,
    locale: (a.locale as 'ro' | 'en') ?? undefined,
    alt: locz ? { id: locz.id, title: locz.attributes.title, locale: locz.attributes.locale, slug: locz.attributes.slug ?? undefined } : undefined,
  };
}

export async function getLastEvents(): Promise<ChurchEvent[]> {
  const query = qs.stringify(
    { sort: 'startDate:asc', pagination: { limit: EVENT_CAROUSEL_LIMIT }, populate: '*' },
    { encodeValuesOnly: true },
  );
  const res = await api<{ data: StrapiEntry[] }>(`/events?${query}`);
  return (res?.data ?? []).map((e) => buildEvent(e.id, e.attributes));
}

const byStartAsc = (a: ChurchEvent, b: ChurchEvent) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0);
const byStartDesc = (a: ChurchEvent, b: ChurchEvent) => -byStartAsc(a, b);

export async function getAllEvents(locale?: Locale): Promise<ChurchEvent[]> {
  const query = qs.stringify(
    { pagination: { pageSize: 100 }, populate: { cover: true, localizations: true } },
    { encodeValuesOnly: true },
  );
  const rows = await fetchListMerged(`/events?${query}`, locale);
  return rows.map((e) => buildEvent(e.id, e.attributes)).sort(byStartDesc);
}

export async function getPaginatedEvents(page: number): Promise<{ events: ChurchEvent[]; pageCount: number }> {
  const query = qs.stringify(
    { sort: 'startDate:desc', pagination: { page, pageSize: PAGE_SIZE }, populate: '*' },
    { encodeValuesOnly: true },
  );
  const res = await api<{ data: StrapiEntry[]; meta: { pagination?: { pageCount: number } } }>(`/events?${query}`);
  const events = (res?.data ?? []).map((e) => buildEvent(e.id, e.attributes));
  return { events, pageCount: res?.meta?.pagination?.pageCount ?? 0 };
}

// Evenimente care nu s-au încheiat încă (endDate >= azi), cele mai apropiate primele.
export async function getUpcomingEvents(limit = 20, locale?: Locale): Promise<ChurchEvent[]> {
  const today = new Date().toISOString().slice(0, 10);
  const query = qs.stringify(
    { filters: { endDate: { $gte: today } }, pagination: { pageSize: 100 }, populate: '*' },
    { encodeValuesOnly: true },
  );
  const rows = await fetchListMerged(`/events?${query}`, locale);
  return rows.map((e) => buildEvent(e.id, e.attributes)).sort(byStartAsc).slice(0, limit);
}

// Arhivă: evenimente încheiate (endDate < azi), cele mai recente primele, paginate.
export async function getPastEvents(page: number, locale?: Locale): Promise<{ events: ChurchEvent[]; pageCount: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const query = qs.stringify(
    {
      filters: { endDate: { $lt: today } },
      sort: 'startDate:desc',
      pagination: { page, pageSize: PAGE_SIZE },
      populate: '*',
    },
    { encodeValuesOnly: true },
  );
  const res = await api<{ data: StrapiEntry[]; meta: { pagination?: { pageCount: number } } }>(loc(`/events?${query}`, locale));
  const events = (res?.data ?? []).map((e) => buildEvent(e.id, e.attributes));
  return { events, pageCount: res?.meta?.pagination?.pageCount ?? 0 };
}

export async function getEvent(id: string): Promise<ChurchEvent | null> {
  const query = qs.stringify({ populate: { cover: true, localizations: true } }, { encodeValuesOnly: true });
  const res = await api<{ data: StrapiEntry | null }>(`/events/${id}?${query}`);
  if (!res?.data) return null;
  return buildEvent(res.data.id, res.data.attributes);
}

// Un rând după (slug, locale) — cu fallback pe RO dacă versiunea în limba cerută lipsește.
async function firstBySlug(
  collection: string,
  slug: string,
  locale: Locale | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  populate: any,
): Promise<StrapiEntry | null> {
  const query = qs.stringify({ filters: { slug: { $eq: slug } }, populate, pagination: { limit: 1 } }, { encodeValuesOnly: true });
  let res = await api<{ data: StrapiEntry[] }>(loc(`/${collection}?${query}`, locale));
  let row = res?.data?.[0];
  if (!row && locale && locale !== 'ro') {
    res = await api<{ data: StrapiEntry[] }>(`/${collection}?${query}`);
    row = res?.data?.[0];
  }
  return row ?? null;
}

export async function getEventBySlug(slug: string, locale?: Locale): Promise<ChurchEvent | null> {
  const row = await firstBySlug('events', slug, locale, { cover: true, localizations: true });
  return row ? buildEvent(row.id, row.attributes) : null;
}

// Caută un slug VECHI (redenumit) → pentru redirect 301 către slug-ul curent. Verifică apartenența exactă.
async function firstByOldSlug(collection: string, seg: string, locale?: Locale): Promise<StrapiEntry | null> {
  const query = qs.stringify({ filters: { oldSlugs: { $contains: seg } }, pagination: { limit: 5 } }, { encodeValuesOnly: true });
  let res = await api<{ data: StrapiEntry[] }>(loc(`/${collection}?${query}`, locale));
  let rows = res?.data ?? [];
  if (!rows.length && locale && locale !== 'ro') {
    res = await api<{ data: StrapiEntry[] }>(`/${collection}?${query}`);
    rows = res?.data ?? [];
  }
  return rows.find((r) => String(r.attributes.oldSlugs || '').split(',').map((s) => s.trim()).includes(seg)) ?? null;
}

export async function getProjectByOldSlug(seg: string, locale?: Locale): Promise<Project | null> {
  const row = await firstByOldSlug('projects', seg, locale);
  return row ? buildProject(row.id, row.attributes) : null;
}
export async function getEventByOldSlug(seg: string, locale?: Locale): Promise<ChurchEvent | null> {
  const row = await firstByOldSlug('events', seg, locale);
  return row ? buildEvent(row.id, row.attributes) : null;
}
export async function getArticleByOldSlug(seg: string, locale?: Locale): Promise<Article | null> {
  const row = await firstByOldSlug('articles', seg, locale);
  return row ? buildArticle(row.id, row.attributes) : null;
}

// Arhivă: evenimente încheiate (endDate < azi), cele mai recente primele — listă (pt. „vezi mai multe”).
export async function getArchivedEvents(limit = 40, locale?: Locale): Promise<ChurchEvent[]> {
  const today = new Date().toISOString().slice(0, 10);
  const query = qs.stringify(
    { filters: { endDate: { $lt: today } }, pagination: { pageSize: 100 }, populate: { cover: true, localizations: true } },
    { encodeValuesOnly: true },
  );
  const rows = await fetchListMerged(`/events?${query}`, locale);
  return rows.map((e) => buildEvent(e.id, e.attributes)).sort(byStartDesc).slice(0, limit);
}

export async function getProjects(locale?: Locale): Promise<Project[]> {
  const query = qs.stringify(
    { sort: 'id:asc', pagination: { pageSize: 100 }, populate: { cover: true, localizations: true } },
    { encodeValuesOnly: true },
  );
  const rows = await fetchListMerged(`/projects?${query}`, locale);
  return rows.map((e) => buildProject(e.id, e.attributes)).sort((a, b) => a.id - b.id);
}

export async function getProject(id: string): Promise<Project | null> {
  const query = qs.stringify(
    { populate: { cover: true, localizations: true, ensembles: { populate: ['conductors', 'videos', 'images'] } } },
    { encodeValuesOnly: true },
  );
  const res = await api<{ data: StrapiEntry | null }>(`/projects/${id}?${query}`);
  if (!res?.data) return null;
  return buildProject(res.data.id, res.data.attributes);
}

export async function getProjectBySlug(slug: string, locale?: Locale): Promise<Project | null> {
  const row = await firstBySlug('projects', slug, locale, {
    cover: true,
    localizations: true,
    ensembles: { populate: ['conductors', 'videos', 'images'] },
  });
  return row ? buildProject(row.id, row.attributes) : null;
}

export async function getAllProjects(locale?: Locale): Promise<Project[]> {
  return getProjects(locale);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildArticle(id: number, a: any): Article {
  const cover = a.cover?.data?.attributes;
  const large = cover?.formats?.large ?? cover;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locz = (a.localizations?.data ?? [])[0];
  return {
    id,
    title: a.title,
    excerpt: a.excerpt ?? '',
    content: a.content ?? '',
    coverSmall: cover?.formats?.medium?.url ?? cover?.formats?.small?.url ?? cover?.url ?? '',
    coverLarge: cover?.formats?.large?.url ?? cover?.url ?? '',
    coverWidth: large?.width ?? undefined,
    coverHeight: large?.height ?? undefined,
    author: a.author ?? undefined,
    date: a.date ?? undefined,
    slug: a.slug ?? undefined,
    locale: (a.locale as 'ro' | 'en') ?? undefined,
    alt: locz ? { id: locz.id, title: locz.attributes.title, locale: locz.attributes.locale, slug: locz.attributes.slug ?? undefined } : undefined,
  };
}

export async function getArticles(locale?: Locale): Promise<Article[]> {
  const query = qs.stringify(
    { sort: ['date:desc', 'id:desc'], pagination: { pageSize: 100 }, populate: { cover: true, localizations: true } },
    { encodeValuesOnly: true },
  );
  const rows = await fetchListMerged(`/articles?${query}`, locale);
  return rows
    .map((e) => buildArticle(e.id, e.attributes))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || b.id - a.id);
}

export const getAllArticles = getArticles;

export async function getArticle(id: string): Promise<Article | null> {
  const query = qs.stringify({ populate: { cover: true, localizations: true } }, { encodeValuesOnly: true });
  const res = await api<{ data: StrapiEntry | null }>(`/articles/${id}?${query}`);
  if (!res?.data) return null;
  return buildArticle(res.data.id, res.data.attributes);
}

export async function getArticleBySlug(slug: string, locale?: Locale): Promise<Article | null> {
  const row = await firstBySlug('articles', slug, locale, { cover: true, localizations: true });
  return row ? buildArticle(row.id, row.attributes) : null;
}
