// ============================================================================
//  CONFIGURAȚIA BISERICII  ·  EDITEAZĂ ACEST FIȘIER CA SĂ REBRANDUIEȘTI
// ----------------------------------------------------------------------------
//  Church identity config. To reuse this stack for another church, edit ONLY:
//    1. this file          → identity/SEO fallbacks below
//    2. .env               → secrets & per-deploy config (see .env.example)
//    3. the Strapi admin   → live content (name, address, phone, email, pastor,
//                            social links, brand colors — church-info/contact/style)
//  Nothing else in the code contains church-specific data. The values below are
//  only fallbacks used when the matching CMS field is empty.
// ============================================================================

export const site = {
  // Public canonical URL. Overridden by NEXT_PUBLIC_SITE_URL (set it in .env).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adventistcluj.ro',

  // Church name (RO / EN) — fallback for CMS church-info.churchName.
  name: {
    ro: 'Biserica Adventistă „Speranța” Cluj-Napoca',
    en: 'Speranța Seventh-day Adventist Church, Cluj-Napoca',
  },
  shortName: 'Speranța Cluj',

  // Meta description fallback (RO / EN) — fallback for church-info.description.
  description: {
    ro:
      'Biserica Adventistă de Ziua a Șaptea „Speranța” din Cluj-Napoca — o comunitate creștină primitoare. ' +
      'Serviciul divin are loc sâmbăta pe Strada Moților 47. Program, evenimente și transmisiuni live.',
    en:
      'The Speranța Seventh-day Adventist Church in Cluj-Napoca — a welcoming Christian community. ' +
      'Worship service takes place on Saturdays. Schedule, events and live streams.',
  },

  // Visible brand text in the header (two lines).
  brand: { line1: 'Biserica Adventistă', line2: 'Speranța · Cluj-Napoca' },

  // Motto / slogan (RO / EN).
  slogan: { ro: 'Trăiește frumos și curat', en: 'Live beautifully and purely' },

  // GPS coordinates — JSON-LD GeoCoordinates + sunset time (Sabbath start).
  geo: { lat: 46.766337, lng: 23.577768 },

  // Structured address (schema.org PostalAddress).
  address: {
    street: 'Strada Moților 47',
    locality: 'Cluj-Napoca',
    region: 'Cluj',
    postalCode: '400001',
    country: 'RO',
  },

  // Extra SEO / AEO facts.
  foundingYear: '1995',
  areaServed: 'Cluj-Napoca',
  alternateNames: ['Biserica Adventistă Speranța Cluj-Napoca', 'Adventist Church Cluj', 'Speranța Cluj'],
  keywords:
    'biserică adventistă Cluj, adventist Cluj-Napoca, Biserica Speranța, serviciu divin, Școala de Sabat, creștini adventiști, Adventist church Cluj',

  // Parent denomination (default for an Adventist stack; change for your union).
  parentOrganization: { name: 'Biserica Adventistă de Ziua a Șaptea din România', url: 'https://adventist.ro' },

  // Brand colors — fallback only; CMS "style" overrides these at runtime.
  colors: { primary: '#c0351b', secondPrimary: '#f78a58', accent: '#245aa6', secondAccent: '#739bd2' },

  // Footer "useful links" (denominational media). Edit for your region.
  footerLinks: [
    { href: 'https://adventist.ro', label: 'Adventist.ro' },
    { href: 'https://semneletimpului.ro', label: 'Semnele Timpului' },
    { href: 'https://respiro.ro', label: 'Revista Respiro' },
    { href: 'http://www.sperantatv.ro', label: 'Speranța TV' },
    { href: 'https://rvs.ro', label: 'Radio Vocea Speranței' },
    { href: 'https://adra.ro', label: 'ADRA' },
  ],
} as const;

type L = 'ro' | 'en';
export const siteName = (locale: L): string => (locale === 'en' ? site.name.en : site.name.ro);
export const siteDescription = (locale: L): string => (locale === 'en' ? site.description.en : site.description.ro);
export const siteSlogan = (locale: L): string => (locale === 'en' ? site.slogan.en : site.slogan.ro);
