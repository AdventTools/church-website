'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';
import styles from './CopyField.module.scss';

type Props = {
  label: string;
  // Textul copiat exact (ex. IBAN-ul fără spații); `display` e doar forma afișată.
  value: string;
  display?: string;
  mono?: boolean;
  copy: string;
  copied: string;
  copyFailed: string;
  copyLabel: string;
  children?: ReactNode;
};

// Telefoanele mai vechi (sau paginile fără HTTPS) nu au navigator.clipboard: copiem printr-un
// textarea temporar + execCommand. `readOnly` + font 16px evită tastatura și zoom-ul pe iOS.
function legacyCopy(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.readOnly = true;
  ta.style.position = 'fixed';
  ta.style.top = '0';
  ta.style.opacity = '0';
  ta.style.fontSize = '16px';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // permisiune refuzată sau context nesigur: încercăm metoda veche
    }
  }
  return legacyCopy(text);
}

export default function CopyField({ label, value, display, mono, copy, copied, copyFailed, copyLabel, children }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function onCopy() {
    const ok = await copyText(value);
    setState(ok ? 'copied' : 'failed');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), ok ? 2000 : 5000);
  }

  return (
    <div className={styles.field}>
      <p className={styles.label}>{label}</p>
      <div className={styles.row}>
        <p className={`${styles.value} ${mono ? styles.mono : ''}`}>{display ?? value}</p>
        <button
          type="button"
          onClick={onCopy}
          className={`${styles.button} ${state === 'copied' ? styles.done : ''}`}
          aria-label={state === 'copied' ? `${copied}: ${label}` : copyLabel}
        >
          {state === 'copied' ? <Check size={22} aria-hidden /> : <Copy size={22} aria-hidden />}
          <span>{state === 'copied' ? copied : copy}</span>
        </button>
      </div>
      <p className={styles.status} role="status" aria-live="polite">
        {state === 'failed' ? copyFailed : state === 'copied' ? <span className={styles.srOnly}>{copied}</span> : null}
      </p>
      {children}
    </div>
  );
}
