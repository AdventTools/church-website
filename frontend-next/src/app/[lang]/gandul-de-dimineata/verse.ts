// Referința stă de obicei în câmpul ei, dar textele lipite din alte surse o au adesea la finalul
// versetului, între paranteze. Aici o separăm la afișare și curățăm eventuale marcaje de citat
// introduse din panou.

export type Verse = { text: string; reference?: string };

export function cleanVerse(verse?: string, reference?: string): Verse | null {
  if (!verse) return null;

  let text = verse
    .replace(/(^|\s)>+(?=\s|$)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  let ref = reference?.trim() || undefined;

  if (!ref) {
    const m = text.match(/\(\s*([^()]{2,60}?)\s*\)\s*$/);
    // O referinta biblica are intotdeauna cifre (capitol/verset) — altfel e text obisnuit.
    if (m && /\d/.test(m[1])) {
      ref = m[1];
      text = text.slice(0, m.index).trim();
    }
  }

  return text ? { text, reference: ref } : null;
}
