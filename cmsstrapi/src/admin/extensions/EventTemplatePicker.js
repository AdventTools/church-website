import React, { useEffect, useState } from 'react';
import { useCMEditViewDataManager, useFetchClient } from '@strapi/helper-plugin';

// Câmpurile pe care le precompletează un șablon (doar cele completate în șablon).
const FIELDS = ['title', 'intro', 'content', 'locationName', 'locationAddress', 'locationMapLink', 'facebookLink'];

// Dropdown în ecranul de eveniment: alegi un șablon → îți precompletează câmpurile.
const EventTemplatePicker = () => {
  const { slug, modifiedData, onChange } = useCMEditViewDataManager();
  const { get } = useFetchClient();
  const [templates, setTemplates] = useState([]);
  const [sel, setSel] = useState('');
  const locale = (modifiedData && modifiedData.locale) || 'ro';

  useEffect(() => {
    if (slug !== 'api::event.event') return;
    get('/content-manager/collection-types/api::event-template.event-template', {
      params: { locale, pageSize: 100, sort: 'name:ASC' },
    })
      .then((res) => setTemplates((res.data && res.data.results) || []))
      .catch(() => {});
  }, [slug, locale, get]);

  if (slug !== 'api::event.event' || !templates.length) return null;

  const apply = async (id) => {
    setSel(id);
    if (!id) return;
    let tpl;
    try {
      const res = await get(`/content-manager/collection-types/api::event-template.event-template/${id}`);
      tpl = res.data;
    } catch (e) {
      setSel('');
      return;
    }
    if (tpl) {
      const setField = (name, value) => onChange({ target: { name, value } });
      for (const f of FIELDS) {
        const v = tpl[f];
        if (v != null && String(v).trim() !== '') setField(f, v);
      }
      if (tpl.cover) {
        try {
          setField('cover', tpl.cover);
        } catch (e) {
          /* imaginea se poate pune manual */
        }
      }
    }
    setSel('');
  };

  return (
    <select
      value={sel}
      onChange={(e) => apply(e.target.value)}
      title="Precompletează câmpurile din șablonul ales. Câmpurile goale rămân neatinse; poți edita orice după aplicare."
      style={{
        height: 36,
        padding: '0 12px',
        borderRadius: 4,
        border: '1px solid #4945ff',
        color: '#4945ff',
        background: '#f0f0ff',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <option value="">📋 Aplică un șablon…</option>
      {templates.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
};

export default EventTemplatePicker;
