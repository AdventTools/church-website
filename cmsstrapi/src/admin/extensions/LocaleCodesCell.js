import React from 'react';

// Coloana i18n din lista Content Manager: în loc de „Content available in" + numele complete ale
// limbilor (ies rândurile din grid), afișăm antet „Limba" + doar codurile (ex. „RO, EN"). Compact.
const LocaleCodes = ({ locale, localizations = [] }) => {
  const list = Array.isArray(localizations) ? localizations : [];
  const codes = [locale, ...list.map((l) => l && l.locale)].filter(Boolean);
  const uniq = Array.from(new Set(codes)).sort();
  return (
    <span
      onClick={(e) => e.stopPropagation()}
      style={{ fontWeight: 600, letterSpacing: '0.04em', color: '#666687', whiteSpace: 'nowrap' }}
    >
      {uniq.map((c) => String(c).toUpperCase()).join(', ')}
    </span>
  );
};

// Rescrie coloana adăugată de plugin-ul i18n (rulează după hook-ul lui, în bootstrap-ul aplicației).
export function registerCompactLocaleColumn(app) {
  app.registerHook('Admin/CM/pages/ListView/inject-column-in-table', ({ displayedHeaders, layout }) => {
    const displayed = displayedHeaders.map((h) =>
      h && h.name === 'locales'
        ? {
            ...h,
            metadatas: { ...h.metadatas, label: 'Limba' },
            cellFormatter: (props) => <LocaleCodes {...props} />,
          }
        : h
    );
    return { displayedHeaders: displayed, layout };
  });
}

export default LocaleCodes;
