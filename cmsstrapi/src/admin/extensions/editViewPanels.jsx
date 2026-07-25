import React, { useEffect, useState } from 'react';
import { Button, Flex, Typography } from '@strapi/design-system';
import { Mail } from '@strapi/icons';
import {
  useNotification,
  useFetchClient,
  useForm,
  unstable_useContentManagerContext as useContentManagerContext,
} from '@strapi/strapi/admin';

// Panouri injectate în bara laterală a ecranului de editare (Strapi 5 „edit view side panels").
// În v4 erau componente injectate în zonele `right-links` / `informations` prin
// `app.injectContentManagerComponent`; în v5 se înregistrează prin
// `content-manager.apis.addEditViewSidePanel([...])`. Fiecare panou întoarce `{ title, content }`
// sau `null` când nu se aplică tipului de conținut curent.

// 1) „Trimite e-mail de test" — doar pe setările „E-mail (SMTP)".
function SmtpTestPanel() {
  const { model } = useContentManagerContext();
  const { toggleNotification } = useNotification();
  const { post } = useFetchClient();
  const [loading, setLoading] = useState(false);

  if (model !== 'api::smtp.smtp') return null;

  const onTest = async () => {
    setLoading(true);
    try {
      const { data } = await post('/api/smtp/test', {});
      if (data && data.ok) {
        toggleNotification({ type: 'success', message: `E-mail de test trimis către ${data.to}. Verifică inboxul.` });
      } else {
        toggleNotification({ type: 'warning', message: (data && data.error) || 'Testul a eșuat.' });
      }
    } catch (err) {
      toggleNotification({ type: 'warning', message: 'Salvează întâi setările (Save), apoi apasă Test.' });
    } finally {
      setLoading(false);
    }
  };

  return {
    title: 'Test e-mail',
    content: (
      <Flex direction="column" alignItems="stretch" gap={2}>
        <Button variant="secondary" startIcon={<Mail />} loading={loading} onClick={onTest} fullWidth>
          Trimite e-mail de test
        </Button>
        <Typography variant="pi" textColor="neutral600">
          Testează configurarea SALVATĂ, trimițând un e-mail către adresa destinatar.
        </Typography>
      </Flex>
    ),
  };
}

// 2) „Eveniment duplicat în aceeași zi" — doar pe evenimente.
function EventDuplicatePanel() {
  const { model, id } = useContentManagerContext();
  const { get } = useFetchClient();
  const startDate = useForm('EventDuplicatePanel', (s) => s.values && s.values.startDate);
  const [dupes, setDupes] = useState([]);

  useEffect(() => {
    if (model !== 'api::event.event' || !startDate) {
      setDupes([]);
      return undefined;
    }
    let active = true;
    get('/content-manager/collection-types/api::event.event', {
      params: { 'filters[startDate][$eq]': startDate, 'pagination[pageSize]': 20, locale: 'ro' },
    })
      .then((res) => {
        if (!active) return;
        const rows = ((res.data && res.data.results) || []).filter((e) => String(e.documentId || e.id) !== String(id));
        setDupes(rows);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [model, startDate, id, get]);

  if (model !== 'api::event.event' || !dupes.length) return null;

  return {
    title: '⚠️ Zi ocupată',
    content: (
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Typography variant="omega" fontWeight="bold" textColor="warning600">
          Există deja eveniment(e) în aceeași zi:
        </Typography>
        {dupes.map((e) => (
          <Typography key={e.documentId || e.id} variant="pi" textColor="warning600">
            • {e.title}
          </Typography>
        ))}
        <Typography variant="pi" textColor="neutral600">
          Verifică să nu fie un duplicat înainte de salvare.
        </Typography>
      </Flex>
    ),
  };
}

// 3) „Aplică un șablon" — precompletează câmpurile evenimentului dintr-un șablon.
const TEMPLATE_FIELDS = ['title', 'intro', 'content', 'locationName', 'locationAddress', 'locationMapLink', 'facebookLink'];

function EventTemplatePanel() {
  const { model } = useContentManagerContext();
  const { get } = useFetchClient();
  const locale = useForm('EventTemplatePanel', (s) => (s.values && s.values.locale) || 'ro');
  const onChange = useForm('EventTemplatePanel', (s) => s.onChange);
  const [templates, setTemplates] = useState([]);
  const [sel, setSel] = useState('');

  useEffect(() => {
    if (model !== 'api::event.event') return;
    get('/content-manager/collection-types/api::event-template.event-template', {
      params: { locale, pageSize: 100, sort: 'name:ASC' },
    })
      .then((res) => setTemplates((res.data && res.data.results) || []))
      .catch(() => {});
  }, [model, locale, get]);

  if (model !== 'api::event.event' || !templates.length) return null;

  const apply = async (documentId) => {
    setSel(documentId);
    if (!documentId) return;
    let tpl;
    try {
      const res = await get(`/content-manager/collection-types/api::event-template.event-template/${documentId}`);
      tpl = res.data && res.data.data ? res.data.data : res.data;
    } catch (e) {
      setSel('');
      return;
    }
    if (tpl) {
      for (const f of TEMPLATE_FIELDS) {
        const v = tpl[f];
        if (v != null && String(v).trim() !== '') onChange(f, v);
      }
      if (tpl.cover) {
        try {
          onChange('cover', tpl.cover);
        } catch (e) {
          /* imaginea se poate pune manual */
        }
      }
    }
    setSel('');
  };

  return {
    title: 'Aplică un șablon',
    content: (
      <Flex direction="column" alignItems="stretch" gap={2}>
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
            width: '100%',
          }}
        >
          <option value="">📋 Alege un șablon…</option>
          {templates.map((t) => (
            <option key={t.documentId || t.id} value={t.documentId || t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <Typography variant="pi" textColor="neutral600">
          Câmpurile goale din șablon rămân neatinse. Poți edita orice după aplicare.
        </Typography>
      </Flex>
    ),
  };
}

// Înregistrează toate panourile la bootstrap-ul aplicației admin (Strapi 5).
export function registerEditViewPanels(app) {
  const cm = app.getPlugin('content-manager');
  if (!cm || !cm.apis || !cm.apis.addEditViewSidePanel) return;
  cm.apis.addEditViewSidePanel([SmtpTestPanel, EventDuplicatePanel, EventTemplatePanel]);
}
