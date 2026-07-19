import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://127.0.0.1:1337';

export async function POST(req: Request) {
  const token = process.env.MAIL_PROXY_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Trimiterea de e-mail nu este configurată.' }, { status: 503 });
  }

  let body: Record<string, string> | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cerere invalidă.' }, { status: 400 });
  }

  const { firstName, lastName, email, phone, text, website } = body ?? {};

  // Honeypot: boții completează câmpul ascuns „website”. Răspundem cu succes fără să trimitem.
  if (website) return NextResponse.json({ ok: true });

  if (!firstName || !lastName || !email || !text) {
    return NextResponse.json({ error: 'Câmpuri obligatorii lipsă.' }, { status: 400 });
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
