import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://127.0.0.1:1337';
// Timp minim de completare umană (ms) — sub atât e aproape sigur bot.
const MIN_FILL_MS = 3000;

export async function POST(req: Request) {
  const token = process.env.MAIL_PROXY_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Trimiterea de e-mail nu este configurată.' }, { status: 503 });
  }

  // Rate-limit per IP (5 cereri / 10 min). Sursa e x-real-ip, pe care îl scrie nginx din adresa
  // conexiunii; x-forwarded-for începe cu ce trimite clientul, deci prima poziție e falsificabilă.
  // Rezerva e ultima poziție din x-forwarded-for, cea adăugată de proxy.
  const forwarded = (req.headers.get('x-forwarded-for') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const ip = req.headers.get('x-real-ip')?.trim() || forwarded[forwarded.length - 1] || 'unknown';
  if (!(await rateLimit(`email:${ip}`, 5, 600))) {
    return NextResponse.json({ error: 'Prea multe încercări. Încearcă din nou mai târziu.' }, { status: 429 });
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cerere invalidă.' }, { status: 400 });
  }

  const { firstName, lastName, email, phone, text, website, elapsed } = (body ?? {}) as Record<string, string> & {
    elapsed?: number;
  };

  // Honeypot: boții completează câmpul ascuns „website”. Răspundem cu succes fără să trimitem.
  if (website) return NextResponse.json({ ok: true });

  // Verificare de timp: formularul trimite `elapsed` (ms de la afișare). Prea rapid = bot.
  if (typeof elapsed !== 'number' || elapsed < MIN_FILL_MS) return NextResponse.json({ ok: true });

  if (!firstName || !lastName || !email || !text) {
    return NextResponse.json({ error: 'Câmpuri obligatorii lipsă.' }, { status: 400 });
  }

  const tooLong =
    firstName.length > 100 || lastName.length > 100 || email.length > 254 || (phone?.length ?? 0) > 30 || text.length > 5000;
  if (tooLong) {
    return NextResponse.json({ error: 'Câmpuri prea lungi.' }, { status: 400 });
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/smtp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-mail-token': token },
      body: JSON.stringify({ firstName, lastName, email, phone, text }),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Strapi ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Eroare trimitere e-mail:', err);
    return NextResponse.json({ error: 'Trimiterea a eșuat.' }, { status: 500 });
  }
}
