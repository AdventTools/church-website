'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import styles from './ContactForm.module.scss';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\s()+-]*([0-9][\s()+-]*){10,16}$/;

type Msg = { firstName: string; lastName: string; email: string; phone: string; text: string; website: string };
const EMPTY: Msg = { firstName: '', lastName: '', email: '', phone: '', text: '', website: '' };

export default function ContactForm({ locale = 'ro' }: { locale?: Locale }) {
  const f = t(locale).contact.f;
  const [msg, setMsg] = useState<Msg>(EMPTY);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const set =
    (k: keyof Msg) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setMsg((m) => ({ ...m, [k]: e.target.value }));

  const emailOk = EMAIL_RE.test(msg.email);
  const phoneOk = !msg.phone || PHONE_RE.test(msg.phone);
  const valid = !!msg.lastName && !!msg.firstName && !!msg.text && emailOk && phoneOk;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setShowError(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      if (!res.ok) throw new Error();
      setMsg(EMPTY);
      setShowError(false);
      setToast(f.sent);
    } catch {
      setToast(f.error);
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 4000);
    }
  };

  const cls = (bad: boolean) => (showError && bad ? styles.err : '');

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>{f.lastName} *</span>
          <input
            value={msg.lastName}
            onChange={set('lastName')}
            className={cls(!msg.lastName)}
            required
            autoComplete="family-name"
          />
        </label>
        <label className={styles.field}>
          <span>{f.firstName} *</span>
          <input
            value={msg.firstName}
            onChange={set('firstName')}
            className={cls(!msg.firstName)}
            required
            autoComplete="given-name"
          />
        </label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>{f.email} *</span>
          <input
            type="email"
            value={msg.email}
            onChange={set('email')}
            className={cls(!emailOk)}
            required
            autoComplete="email"
          />
        </label>
        <label className={styles.field}>
          <span>{f.phone}</span>
          <input type="tel" value={msg.phone} onChange={set('phone')} className={cls(!phoneOk)} autoComplete="tel" />
        </label>
      </div>
      <label className={styles.field}>
        <span>{f.message} *</span>
        <textarea rows={5} value={msg.text} onChange={set('text')} className={cls(!msg.text)} required />
      </label>
      {/* Honeypot anti-spam: ascuns pentru oameni, tentant pentru boți. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={msg.website}
        onChange={set('website')}
        className={styles.hp}
      />
      <button type="submit" className="btn" disabled={loading}>
        {loading ? f.sending : f.send}
      </button>
      {toast && <p className={styles.toast}>{toast}</p>}
    </form>
  );
}
