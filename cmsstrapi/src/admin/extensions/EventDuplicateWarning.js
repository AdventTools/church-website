import React, { useEffect, useState } from 'react';
import { useCMEditViewDataManager, useFetchClient } from '@strapi/helper-plugin';

// Avertisment în ecranul de editare a unui eveniment: dacă mai există alt eveniment în aceeași zi,
// afișează o notă (ca să eviți dublurile). Vede și evenimentele altor utilizatori.
const EventDuplicateWarning = () => {
  const { modifiedData, initialData, slug } = useCMEditViewDataManager();
  const { get } = useFetchClient();
  const [dupes, setDupes] = useState([]);

  const startDate = modifiedData && modifiedData.startDate;
  const currentId = initialData && initialData.id;

  useEffect(() => {
    if (slug !== 'api::event.event' || !startDate) {
      setDupes([]);
      return undefined;
    }
    let active = true;
    get('/content-manager/collection-types/api::event.event', {
      params: { 'filters[startDate][$eq]': startDate, 'pagination[pageSize]': 20, locale: 'ro' },
    })
      .then((res) => {
        if (!active) return;
        const rows = ((res.data && res.data.results) || []).filter((e) => e.id !== currentId);
        setDupes(rows);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug, startDate, currentId, get]);

  if (slug !== 'api::event.event' || !dupes.length) return null;

  return (
    <div
      style={{
        background: '#fff4e5',
        border: '1px solid #f0b357',
        borderRadius: 8,
        padding: '12px 14px',
        marginBottom: 16,
      }}
    >
      <strong style={{ color: '#8a5300' }}>⚠️ Există deja eveniment(e) în aceeași zi:</strong>
      <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: '#8a5300' }}>
        {dupes.map((e) => (
          <li key={e.id}>{e.title}</li>
        ))}
      </ul>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#8a5300' }}>
        Verifică să nu fie un duplicat înainte de salvare.
      </p>
    </div>
  );
};

export default EventDuplicateWarning;
