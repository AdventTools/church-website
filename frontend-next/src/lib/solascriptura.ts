import { site } from '@/config/site';

// Gândul zilei, preluat din fluxul Atom public al Sola Scriptura (anunțat pe solascriptura.ro/ganduri).
// Fluxul ține ultimele ~30 de zile și se schimbă la miezul nopții. Textul e preluat întreg, cu sursa
// și link către pagina zilei la ei; HTML-ul lor nu ajunge niciodată în pagina noastră: se reduce
// la paragrafe de text simplu. Fluxul e doar în română; se oprește din `site.dailyThoughts`.

export const SOURCE_NAME = 'Sola Scriptura';
export const SOURCE_URL = 'https://solascriptura.ro/ganduri';
const FEED_URL = 'https://api.solascriptura.ro/api/v1/ganduri/feed';

export type DailyThought = {
  date: string; // YYYY-MM-DD
  url: string;
  verse: string;
  reference?: string;
  paragraphs: string[];
};

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  icirc: 'î',
  Icirc: 'Î',
  acirc: 'â',
  Acirc: 'Â',
  // În flux, „a” cu tildă apare în loc de „ă” (greșeală de tastare a sursei); în română nu există.
  atilde: 'ă',
  Atilde: 'Ă',
  bdquo: '„',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
  ndash: '–',
  mdash: '—',
  hellip: '…',
};

const decode = (s: string): string =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e] ?? m;
  });

// Sursa scrie s și t cu sedilă (U+015F, U+0163), forma veche; pe site folosim virgula dedesubt.
// Codurile stau ca escape-uri, ca să nu ajungă litere cu sedilă în sursă.
const normalize = (s: string): string =>
  s
    .replace(/ş/g, 'ș')
    .replace(/Ş/g, 'Ș')
    .replace(/ţ/g, 'ț')
    .replace(/Ţ/g, 'Ț')
    .replace(/ã/g, 'ă')
    .replace(/Ã/g, 'Ă');

const text = (html: string): string =>
  normalize(decode(html.replace(/<[^>]+>/g, ' ')))
    .replace(/\s+/g, ' ')
    .trim();

const cdata = (block: string, tag: string): string => {
  const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
  return m ? m[1] : '';
};

// „Verset...” - 1 Corinteni 3:14 → versetul și referința, despărțite la ultima cratimă.
function splitVerse(summary: string): { verse: string; reference?: string } {
  const s = text(summary);
  const m = s.match(/^(.*[”"])\s*[-–—]\s*(.+\d.*)$/);
  return m ? { verse: m[1].trim(), reference: m[2].trim() } : { verse: s };
}

function parse(xml: string): DailyThought[] {
  const out: DailyThought[] = [];
  for (const block of xml.split('<entry>').slice(1)) {
    const url = block.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? '';
    const date = url.match(/date=(\d{4}-\d{2}-\d{2})/)?.[1];
    if (!date) continue;
    const { verse, reference } = splitVerse(cdata(block, 'summary'));
    const paragraphs = cdata(block, 'content')
      .split(/<\/p>|<br\s*\/?>/i)
      .map(text)
      .filter(Boolean);
    if (!paragraphs.length && !verse) continue;
    out.push({ date, url: url.replace('://www.', '://'), verse, reference, paragraphs });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// Ziua de azi în România, nu în fusul serverului.
export const todayInRomania = (): string => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest' }).format(new Date());

// Gândul de azi și zilele dinainte. Fluxul căzut sau schimbat dă o listă goală: pagina rămâne
// cu devoționalele din CMS, fără eroare.
export async function getDailyThoughts(): Promise<{ today: DailyThought | null; previous: DailyThought[] }> {
  if (!site.dailyThoughts) return { today: null, previous: [] };
  let xml = '';
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000) });
    if (res.ok) xml = await res.text();
  } catch {
    return { today: null, previous: [] };
  }
  const today = todayInRomania();
  const past = parse(xml).filter((t) => t.date <= today);
  return { today: past[0] ?? null, previous: past.slice(1) };
}
