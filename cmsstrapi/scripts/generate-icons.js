'use strict';

// Regenerează iconițele site-ului și imaginea pentru distribuire (Open Graph) din sigla bisericii:
// un singur fișier pătrat (SVG sau PNG transparent), pus pe un disc în culoarea de brand.
//
//   node scripts/generate-icons.js --logo ../sigla.svg --color '#245aa6' \
//     [--wordmark ../logo-lat.png] [--name 'Biserica X'] [--tagline 'Orașul · Strada 1'] [--out dir]
//
// Scrie în `frontend-next/public/` (sau în `--out`, ca să vezi rezultatul înainte): favicon.ico, favicon-96x96.png, apple-touch-icon.png,
// web-app-manifest-192x192.png, web-app-manifest-512x512.png, og-image.png (+ favicon.svg dacă
// sigla e SVG). Rulează din cmsstrapi fiindcă aici e instalat `sharp`.
// Fără pasul ăsta, la rebranding rămân iconițele vechii biserici: favicon, iconița de aplicație
// de pe telefon și imaginea care apare când cineva trimite un link pe WhatsApp sau Facebook.

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const PUBLIC_DIR = path.resolve(__dirname, '../../frontend-next/public');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`Lipsește valoarea pentru ${argv[i]}`);
    out[argv[i].slice(2)] = value;
    i += 1;
  }
  return out;
}

const escapeXml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.logo || !args.color) {
    console.error("Lipsesc --logo și --color. Exemplu: node scripts/generate-icons.js --logo ../sigla.svg --color '#245aa6'");
    process.exit(1);
  }
  if (!/^#[0-9a-f]{6}$/i.test(args.color)) throw new Error('--color trebuie să fie de forma #rrggbb');
  const logo = path.resolve(args.logo);
  if (!fs.existsSync(logo)) throw new Error(`Nu găsesc sigla: ${logo}`);
  const PUB = args.out ? path.resolve(args.out) : PUBLIC_DIR;
  fs.mkdirSync(PUB, { recursive: true });

  // SVG-ul se rasterizează mare, ca micșorarea să rămână clară la orice dimensiune.
  const source = await sharp(logo, { density: 600 }).resize(1024, 1024, { fit: 'inside' }).png().toBuffer();

  // Sigla pe disc colorat: se vede și pe fundal deschis, și pe închis.
  async function disc(size) {
    const circle = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
    const box = Math.round(size * 0.62);
    const inner = await sharp(source).resize(box, box, { fit: 'inside' }).toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background: args.color } })
      .composite([
        { input: circle, blend: 'dest-in' },
        { input: inner, gravity: 'center' },
      ])
      .png()
      .toBuffer();
  }

  for (const [size, file] of [
    [512, 'web-app-manifest-512x512.png'],
    [192, 'web-app-manifest-192x192.png'],
    [180, 'apple-touch-icon.png'],
    [96, 'favicon-96x96.png'],
  ]) {
    fs.writeFileSync(path.join(PUB, file), await disc(size));
  }

  // ICO adevărat, nu un PNG redenumit. Formatul acceptă PNG încapsulat (Vista încolo), deci e de
  // ajuns antetul de 22 de octeți în fața imaginii.
  const png = await disc(48);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // rezervat
  header.writeUInt16LE(1, 2); // tip: iconiță
  header.writeUInt16LE(1, 4); // număr de imagini
  header.writeUInt8(48, 6); // lățime
  header.writeUInt8(48, 7); // înălțime
  header.writeUInt8(0, 8); // culori din paletă (0 = fără paletă)
  header.writeUInt8(0, 9); // rezervat
  header.writeUInt16LE(1, 10); // planuri de culoare
  header.writeUInt16LE(32, 12); // biți per pixel
  header.writeUInt32LE(png.length, 14); // dimensiunea imaginii
  header.writeUInt32LE(22, 18); // offsetul imaginii
  fs.writeFileSync(path.join(PUB, 'favicon.ico'), Buffer.concat([header, png]));

  if (path.extname(logo).toLowerCase() === '.svg') fs.copyFileSync(logo, path.join(PUB, 'favicon.svg'));

  // Open Graph 1200x630: fără ea, orice distribuire pe Facebook/WhatsApp apare fără imagine.
  // Fundal alb, bandă în culoarea de brand; sus sigla lată (sau emblema pe discul colorat — o
  // emblemă albă ar dispărea pe alb), dedesubt numele și sloganul.
  const W = 1200;
  const H = 630;
  const hasText = Boolean(args.name || args.tagline);
  const mark = args.wordmark
    ? await sharp(path.resolve(args.wordmark), { density: 600 }).resize(800, hasText ? 240 : 360, { fit: 'inside' }).png().toBuffer()
    : await disc(hasText ? 240 : 360);
  const meta = await sharp(mark).metadata();
  const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <circle cx="1130" cy="-40" r="250" fill="${args.color}" opacity="0.07"/>
  <rect x="0" y="0" width="${W}" height="14" fill="${args.color}"/>
  ${args.name ? `<text x="600" y="460" text-anchor="middle" font-family="sans-serif" font-size="44" font-weight="700" fill="#17222e">${escapeXml(args.name)}</text>` : ''}
  ${args.tagline ? `<text x="600" y="520" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#5b6b7a">${escapeXml(args.tagline)}</text>` : ''}
</svg>`);
  const top = hasText ? Math.max(60, 380 - meta.height) : Math.round((H - meta.height) / 2);
  await sharp({ create: { width: W, height: H, channels: 4, background: '#ffffff' } })
    .composite([
      { input: overlay, top: 0, left: 0 },
      { input: mark, top, left: Math.round((W - meta.width) / 2) },
    ])
    .png()
    .toFile(path.join(PUB, 'og-image.png'));

  console.log(`iconițe + og-image generate în ${PUB}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
