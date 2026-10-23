// Tipuri de conținut, plate — oglindesc content-types-urile din Strapi.

export type Locale = 'ro' | 'en';
export const LOCALES: Locale[] = ['ro', 'en'];
export const DEFAULT_LOCALE: Locale = 'ro';

export type ChurchInfo = {
  tabTitle: string;
  faviconUrl: string;
  description: string;
  churchName: string;
  nameLogoUrl: string;
  address: string;
  locationMapLink?: string;
  youtubeLink?: string;
  youtubeChannelName?: string;
  facebookLink?: string;
  instagramLink?: string;
};

export type Style = {
  primaryColor: string;
  secondPrimaryColor: string;
  accentColor: string;
  secondAccentColor: string;
};

export type BackgroundImages = {
  home: string;
  program?: string;
  contact?: string;
};

export type Value = {
  icon: string;
  title: string;
  text: string;
};

export type Beliefs = {
  title: string;
  intro?: string;
  content: string;
};

export type HomePage = {
  title: string;
  aboutUs: string;
  description?: string;
  values: Value[];
};

export type Contact = {
  pastor?: string;
  phone?: string;
  email: string;
  address: string;
  mapsIframeSrc?: string;
};

export type HistoryEntry = {
  id: number;
  period: string;
  description: string;
};

export type GalleryImage = {
  id: number;
  large: string;
  small: string;
  width: number;
  height: number;
  alt: string;
};

export type Gallery = {
  description: string;
  images: GalleryImage[];
};

// Numele temei vine deja în limba paginii (RO, sau EN cu rezervă pe RO).
export type GalleryTopic = {
  name: string;
  order: number;
};

export type PhotoAlbum = {
  id: number;
  documentId: string;
  title: string;
  slug?: string;
  date: string;
  description: string;
  topic: GalleryTopic | null;
  cover: GalleryImage | null;
  photos: GalleryImage[];
  event: { id: number; title: string; slug?: string } | null;
};

// Filmele alese din CMS; cele de pe canal (RSS) au tipul `Video` din lib/youtube.ts.
export type GalleryVideo = {
  id: number;
  documentId: string;
  title: string;
  date: string;
  description: string;
  youtubeId: string;
  topic: GalleryTopic | null;
  thumbnail: string;
  featured: boolean;
};

export type Devotional = {
  id: number;
  title: string;
  slug?: string;
  verse?: string;
  verseReference?: string;
  content: string;
  date?: string;
  locale?: Locale;
  alt?: { id: number; title: string; locale: Locale; slug?: string };
};

export type GalleryPage = {
  intro: string;
  photoCardImages: GalleryImage[];
  videoCardImages: GalleryImage[];
};

export type Program = {
  id: number;
  name: string;
  day: string;
  time: string;
  live: boolean;
  expirationDate?: string;
};

export type Highlight = {
  icon: string;
  title: string;
  text: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type FirstVisit = {
  title: string;
  subtitle?: string;
  intro?: string;
  highlights: Highlight[];
  faqs: Faq[];
  closingTitle?: string;
  closingText?: string;
};

// Pagina de donații: IBAN-ul vine deja fără spații, cu majuscule; pagina există doar când e completat.
export type Donation = {
  beneficiary: string;
  iban: string;
  bank?: string;
  currency?: string;
  paymentDetails: string;
  thankYou?: string;
};

// Datele rămân string ISO (serializabile server -> client). Se convertesc cu new Date() la afișare.
export type ChurchEvent = {
  id: number;
  documentId?: string;
  title: string;
  slug?: string;
  startDate: string;
  endDate: string;
  smallImg: string;
  largeImg: string;
  imgWidth?: number;
  imgHeight?: number;
  intro: string;
  content: string;
  facebookLink?: string;
  locationName?: string;
  locationAddress?: string;
  locationMapLink?: string;
  locale?: Locale;
  // Perechea din cealaltă limbă (pentru hreflang corect pe pagini de eveniment).
  alt?: { id: number; title: string; locale: Locale; slug?: string };
};

export type Project = {
  id: number;
  title: string;
  slug?: string;
  summary: string;
  content: string;
  coverSmall: string;
  coverLarge: string;
  coverWidth?: number;
  coverHeight?: number;
  externalUrl?: string;
  ensembles?: Ensemble[];
  locale?: Locale;
  alt?: { id: number; title: string; locale: Locale; slug?: string };
};

export type ProjectVideo = { id: string; title?: string };
export type Ensemble = {
  name: string;
  description?: string;
  peopleLabel?: string;
  conductors: string[];
  videos: ProjectVideo[];
  images: GalleryImage[];
};

export type Article = {
  id: number;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverSmall: string;
  coverLarge: string;
  coverWidth?: number;
  coverHeight?: number;
  author?: string;
  date?: string;
  locale?: Locale;
  alt?: { id: number; title: string; locale: Locale; slug?: string };
};
