import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['ro', 'en'];
const DEFAULT = 'ro';

// RO servit la rădăcină (rescris intern la /ro), EN la /en. Căile cu prefix de locale trec
// neatinse (previne bucla). Forțăm protocolul http pe ținta de rewrite: în spatele proxy-ului
// (X-Forwarded-Proto: https) Next ar reconstrui o țintă https și ar încerca un fetch TLS către
// serverul HTTP intern (:3006) → eroare SSL / 500.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.protocol = 'http:';
  url.pathname = `/${DEFAULT}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
