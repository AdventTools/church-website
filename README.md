> **Limbă:** 🇷🇴 Română (aici) · 🇬🇧 [English](README.en.md)

# Site de biserică — un stack bilingv Next.js + Strapi

Un stack complet, gata de producție, **bilingv (RO/EN)** pentru site-ul unei biserici locale:
un front end rapid, optimizat SEO/AEO, pe [Next.js 16](https://nextjs.org), alimentat integral
de un CMS [Strapi 5](https://strapi.io) self-hosted — astfel încât editori fără cunoștințe tehnice
gestionează tot conținutul dintr-un panou de administrare prietenos.

Construit pentru și rulând în producție la **[adventistcluj.ro](https://adventistcluj.ro)**
(Biserica Adventistă „Speranța" Cluj-Napoca) și gândit ca **orice biserică să-l poată refolosi
ca stack** — îl copiezi, setezi câteva variabile de mediu, completezi CMS-ul și editezi un
singur fișier de configurare pentru rebranding.

> **🌐 Exemplu live:** **[adventistcluj.ro](https://adventistcluj.ro)** — un site complet de
> biserică, rulând exact pe acest stack. Vezi cum arată și cum funcționează în realitate.

---

## Funcționalități

- **Bilingv din construcție** — româna la rădăcină, engleza sub `/en`, cu fallback per element
  (conținutul introdus într-o limbă apare și în cealaltă). `hreflang`, Open Graph localizat,
  sitemap bilingv.
- **Totul editabil din CMS** — pagini, evenimente, proiecte, blog, „ce credem", galerie,
  program, date de contact, culori de brand, SMTP — toate ca tipuri de conținut Strapi.
- **SEO & AEO în prim-plan** — JSON-LD bogat (`Church`/`PlaceOfWorship`, `WebSite`, `Event`,
  `VideoObject`, `FAQPage`, `BreadcrumbList`), canonical + hreflang pe fiecare pagină,
  `sitemap.xml`, `robots.txt`, Speakable, Open Graph/Twitter.
- **Evenimente** — viitoare vs. arhivă, URL-uri curate cu slug și redirect 301 de pe linkurile
  vechi, **șabloane de evenimente** refolosibile (aplici un șablon și precompletezi un eveniment),
  avertisment de duplicat în aceeași zi și roluri de editor granulare (colaboratori per proiect +
  pe propriile evenimente).
- **Blog** — text formatat + imagini din CMS, randat automat cu tipografie îngrijită.
- **Galerie** — pagina `/galerie` cu două intrări, fotografii și video. **Albume foto pe teme**
  (Botezuri, Concerte, Tabere… — temele se definesc în panou, cu nume RO + EN), fiecare album cu
  pagina lui, în rânduri care păstrează proporția fiecărei poze, cu lightbox (zoom, swipe,
  tastatură). Un album se poate lega de un eveniment: pe pagina evenimentului apare „Vezi
  fotografiile”. Până la primul album, pozele din galeria veche („Galerie” din panou) se văd tot aici. **Filme YouTube** alese din panou, grupate pe teme, cu unul recomandat sus;
  playerul se încarcă abia la „play”, de pe domeniul fără cookie-uri. Pe „Despre noi” rămân 4
  poze care duc spre galerie. JSON-LD `ImageGallery` / `VideoObject`, sitemap cu imagini.
- **Integrare YouTube** — banner live + player încorporat când biserica transmite, plus o secțiune
  de predici recente (via RSS public; detecția live e opțională, prin Data API). Aceleași
  transmisiuni apar și pe pagina Video a galeriei, sub filmele alese.
- **Gândul de dimineață** — devoționale scurte (verset + meditație) scrise în panou, RO/EN, cu
  paginile lor și arhivă paginată. Opțional, **gândul zilei** din fluxul public Sola Scriptura
  (în română) apare deasupra lor și pe prima pagină, cu ultimele ~30 de zile din flux, fiecare
  cu link la sursă; se oprește din `site.ts` (`dailyThoughts`).
- **Donații prin transfer bancar (opțional)** — pagina `/donatii` (`/en/donatii`), gândită pentru
  telefon: biserica afișează în sală un cod QR spre ea, iar omul copiază dintr-o atingere
  beneficiarul, IBAN-ul (afișat în grupuri de 4, copiat fără spații) și textul pentru „Detalii
  plată”, apoi plătește din aplicația băncii. Se completează din panou (**Donații**: beneficiar,
  IBAN, bancă, monedă, text implicit pentru „Detalii plată”, mesaj de mulțumire; textele RO + EN).
  Textul implicit poate rămâne gol: atunci câmpul nu are buton de copiere, iar pagina îi spune
  donatorului să-și scrie singur destinația.
  Fără IBAN, pagina dă 404, nu apare în sitemap și nici în footer; nu apare niciodată în meniul
  principal. Pentru QR folosește adresa fără prefix, `https://domeniul-tău/donatii`.
- **Formular de contact** — mesajele se trimit prin setările SMTP din CMS; parola SMTP stă doar
  pe server, niciodată în CMS/DB/API/browser.
- **Confidențialitate** — banner de consimțământ cookie (UE); Google Analytics se încarcă doar
  după accept.
- **Administrare prietenoasă** — brandul bisericii, etichete în română + text de ajutor, grupare
  logică, panouri laterale în editor (test SMTP, avertisment de eveniment duplicat, „Aplică un
  șablon") și panou utilizabil de pe telefon.
- **Invitații pe e-mail** — Strapi nu trimite singur e-mail când inviți un coleg în panou (doar
  afișează un link de copiat). Aici linkul pleacă automat, prin setările SMTP din panou, iar
  **Setări → Site → Invitații** arată invitațiile în așteptare, cu „Retrimite” și „Copiază linkul”.

---

## Stack tehnic

| Nivel     | Tehnologie |
|-----------|------------|
| Front end | Next.js 16 (App Router, React 19), TypeScript, module SCSS |
| CMS       | Strapi 5.58 (i18n în nucleu), MySQL/MariaDB |
| Rulare    | Node.js, self-hosted în spatele nginx + PM2 |
| E-mail    | Nodemailer (SMTP), proxat prin Strapi |

### Arhitectură

```
Browser
   │
   ▼
nginx (TLS, reverse proxy)
   │
   ├─────────────► Next.js 16  (frontend-next)  ── SSR/SSG, revalidare ISR
   │                     │  fetch server-side
   │                     ▼
   └─────────────► Strapi 5   (cmsstrapi)  ── API REST + panou de administrare
                         │
                         ▼
                   MySQL / MariaDB
```

Browserul comunică doar cu Next.js. Next.js aduce conținutul din Strapi pe server; formularul de
contact e proxat prin Strapi, așa că datele SMTP nu ajung niciodată la client.

---

## Structura proiectului

```
frontend-next/      front end Next.js 16
  src/config/site.ts   ← configurarea unică de identitate a bisericii (editează pentru rebrand)
  src/app/             pagini App Router ([lang]/…), sitemap, robots, manifest
  src/app/api/         rute proxy (formular de contact, detecție live YouTube)
  src/proxy.ts         rutarea bilingvă RO/EN
  src/lib/             stratul de date Strapi, helperi SEO/JSON-LD, dicționarul i18n
  src/components/      componente UI
  next.config.ts       configurare Next.js
  .env.example         șablon de variabile de mediu pentru front end
cmsstrapi/          CMS Strapi 5
  src/api/             tipuri de conținut (event, project, article, smtp, …)
  src/admin/           personalizări ale panoului (branding, extensii)
  src/components/      componente de conținut reutilizabile
  src/index.js         bootstrap idempotent (roluri, permisiuni, date de seed)
  src/admin-views.js   etichete + grupare + ascundere de câmpuri în panou
  src/delegate-roles.js roluri delegate (colaborator eveniment, responsabil proiect)
  src/invitations.js   trimiterea automată a invitațiilor în panou
  src/seed/            conținut de exemplu (o biserică îl suprascrie din admin)
  scripts/             unelte de linie de comandă (vezi mai jos)
  config/              server / bază de date / plugin-uri / middlewares
  .env.example         șablon de variabile de mediu pentru CMS
```

### Scripturi (din `cmsstrapi/`)

| Script | La ce folosește |
|---|---|
| `node scripts/set-smtp.js --host … --port 587 --username … --password '…' --from-name '…' --from-email … --to …` | prima configurare a e-mailului din terminal; după aceea se schimbă din panou. Parola se păstrează criptată, ca la butonul din panou |
| `node scripts/test-smtp.js [--send adresa@exemplu.ro]` | verifică conexiunea și autentificarea SMTP fără browser; cu `--send`, trimite o probă pe drumul resetării de parolă |
| `node scripts/resend-invitation.js [--link\|--send adresa]` | listează invitațiile în așteptare, arată linkul unui coleg sau i-l retrimite |
| `node scripts/generate-icons.js --logo sigla.svg --color '#rrggbb' [--wordmark logo.png] [--name '…'] [--tagline '…'] [--out dir]` | regenerează favicon-urile, iconițele de aplicație și imaginea de distribuire (Open Graph) din sigla bisericii |

Scripturile pornesc Strapi în fundal, deci au nevoie de același `.env` și de baza de date.

---

## Cerințe

- **Node.js 24 LTS** (recomandat, testat pe 24.22.1; merge și pe 22, minimul cerut de `cmsstrapi`). Next.js 16 cere minimum 20.9; Strapi 5 e suportat oficial pe Node 22/24/26. Producția rulează Node 22.23.1.
- **npm** pentru `frontend-next` (`package-lock.json`) și **Yarn** pentru `cmsstrapi` (`yarn.lock`)
- **MySQL 8.0+** sau **MariaDB 10.3+** (minimul documentat de Strapi 5; recomandat MariaDB 11.4; producția rulează 10.11)

---

## Pornire rapidă (dezvoltare locală)

### 1. CMS (Strapi)

```bash
cd cmsstrapi
cp .env.example .env          # apoi completează secretele + datele de acces la DB
yarn install
yarn develop                  # http://localhost:1337/admin
```

Generează secretele necesare (`APP_KEYS`, `*_SALT`, `*_SECRET`) cu `openssl rand -base64 32`.
La prima pornire, bootstrap-ul populează conținut de exemplu și configurează rolurile/permisiunile.
Creează-ți contul de admin, apoi editează conținutul ca să se potrivească bisericii tale.

Portul vine din `PORT` în `.env` (exemplul îl setează pe 1337). Fără el, Strapi încearcă portul 80.

### 2. Front end (Next.js)

```bash
cd frontend-next
cp .env.example .env.local     # setează STRAPI_URL + NEXT_PUBLIC_SITE_URL
npm ci
npm run dev                    # http://localhost:3000
```

---

## Configurare — trei straturi clare

Nimic specific unei anumite biserici nu e împrăștiat prin cod. Ca să faci stack-ul al tău, atingi
doar trei locuri:

**1. `.env` — secrete & setări per deployment** (nu se comite niciodată; vezi cele două fișiere
`.env.example`). Baza de date, cheile de securitate Strapi, `SMTP_PASSWORD`, `MAIL_PROXY_TOKEN`,
URL-ul public al site-ului, ID-ul Google Analytics și cheile YouTube.

**2. Panoul Strapi — conținutul live.** Numele bisericii, adresa, telefonul, emailul, pastorul,
linkurile de social media, culorile de brand, programul, paginile, evenimentele, proiectele,
blogul, galeria — toate se editează din panou. Aici petrece cel mai mult timp o biserică ce
refolosește stack-ul.

**3. `frontend-next/src/config/site.ts` — identitate & fallback-uri SEO.** Un singur fișier bine
comentat cu valorile care nu sunt nici secrete, nici conținut de zi cu zi: coordonatele GPS
(folosite la JSON-LD și la ora apusului/începutul Sabatului), adresa poștală structurată, anul
înființării, cuvinte-cheie SEO, linkurile denominaționale din footer, sloganul. Sunt folosite ca
rezervă (fallback) când câmpul corespunzător din CMS e gol. Tot aici, `dailyThoughts` pornește
sau oprește gândul zilei preluat de la Sola Scriptura.

### Listă pentru rebranding

- [ ] `cp .env.example .env` în `cmsstrapi` și `cp .env.example .env.local` în `frontend-next`, apoi completează valorile reale
- [ ] Setează `NEXT_PUBLIC_SITE_URL` cu domeniul tău
- [ ] Editează `frontend-next/src/config/site.ts` (nume, coordonate, adresă, linkuri, slogan)
- [ ] Înlocuiește logo-ul în `frontend-next/public/` și `cmsstrapi/src/admin/extensions/`, apoi
      regenerează iconițele și imaginea de distribuire cu `node scripts/generate-icons.js` (din `cmsstrapi/`)
- [ ] În panoul Strapi, completează **church-info**, **contact**, **style** (culori), **program**
      și setările **E-mail (SMTP)** (inclusiv adresa destinatarului)
- [ ] Opțional, completează și publică **Donații** (IBAN-ul pornește pagina `/donatii`)
- [ ] Ajustează textele meta/descriptive editoriale din `frontend-next/src/lib/i18n.ts`
      (copywriting per pagină) și textele de rezervă pentru „ce credem"/galerie, dacă vrei
- [ ] Înlocuiește conținutul de seed (evenimente, proiecte, articole, „ce credem") din admin și
      ajustează temele galeriei (**Temă galerie**)

---

## Deploy

Deployment-ul de referință rulează în spatele **nginx** (terminare TLS + reverse proxy), cu ambele
aplicații gestionate de **PM2**:

```bash
# CMS
cd cmsstrapi && yarn install && NODE_ENV=production yarn build
pm2 start "yarn start" --name church-strapi

# Front end
cd frontend-next && npm ci && npm run build
pm2 start ./node_modules/next/dist/bin/next --name church-web -- start -H 127.0.0.1 -p 3000
```

nginx proxează domeniul public către portul Next.js și un subdomeniu `cms.` către Strapi.
Merge pe orice host Node (un VPS).

---

## Contribuții

Issue-urile și pull request-urile sunt binevenite. Identificatorii sunt în engleză; comentariile
sunt în mare parte în română — ambele sunt acceptate. Mesajele de commit folosesc convenția
`feat:` / `fix:` / `chore:` / `refactor:` / `docs:`.

---

## Contribuitori

Proiectul are două capitole. Între **2020 și 2025**, o echipă mică a construit și a întreținut
site-ul original al bisericii — o aplicație React + Express + Strapi pe Azure. În **2026** a fost
reconstruit de la zero în stack-ul actual, self-hosted, Next.js 16 + Strapi 5; fiecare linie de cod
din acest repository aparține acelui rebuild. Creditele de mai jos reflectă istoricul git la momentul
publicării open-source (551 de commituri, nov. 2020 – iul. 2026), ponderate după codul scris efectiv
de fiecare — lăsând deoparte codul adus gata făcut (framework-uri, dependințe, fișiere generate).

Istoricul git complet (2020–2026) nu este publicat în acest repository — istoricul vizibil aici
începe de la momentul open-source-ării, cu un singur autor. Cifrele de mai jos provin din
repository-ul privat original.

**Toma Becea** — fondator și dezvoltator principal, de departe cel mai mare contribuitor (~359 de
commituri pe parcursul a peste patru ani). A pornit proiectul și l-a dus aproape de unul singur:
infrastructura ca cod pe Azure (Terraform pentru App Service, MySQL, container registry, DNS, TLS și
storage), pipeline-urile CI/CD pe GitHub Actions, configurarea CMS-ului Strapi și lungul șir de
upgrade-uri de versiune, plus front end-ul React împreună cu stratul de reverse-proxy pe Express și
integrarea YouTube live. O muncă susținută, foarte amplă.

**Melania Bartha** (Betty Melania) — dezvoltatoare front-end de bază (~95 de commituri). A construit
fundația React/TypeScript (router, componente, straturile de API și utilitare, tooling de lint),
autentificarea Google/Facebook, navigația și layout-ul (meniu, footer, sidebar mobil), caruselul de
evenimente de pe prima pagină, funcționalitatea de program și paginile Despre, galerie și contact,
împreună cu o bună parte din tipurile de conținut Strapi.

**Samy Balasa** — arhitect și unic dezvoltator al stack-ului actual (~51 de commituri). A reconstruit
site-ul ca aplicația din acest repository: întregul front end Next.js 16 (strat de date Strapi tipizat,
SSR/SSG și fiecare pagină), CMS-ul Strapi 5 self-hosted cu întregul model de conținut al bisericii,
sistemul bilingv RO/EN cu fallback per element, stratul SEO/AEO (JSON-LD, canonical, sitemap),
subsistemul de evenimente (șabloane refolosibile, roluri de editor, logica de arhivă și redirecturi
pe slug curat), modulele de blog, galerie și muzică, plus formularul de contact cu hardening SMTP și
confidențialitate prin consimțământ cookie. Aplicația React/Express anterioară a fost retrasă în
timpul migrării, deci acesta e un rebuild complet de la zero, nu o extensie a codului precedent.

**Victor Greavu** — contribuitor front-end (~39 de commituri, majoritatea mici). Comportamentul de
scroll al meniului mobil, finisaje vizuale CSS/SCSS și logo-ul SVG din antet + favicon-ul.

**Au mai contribuit:** Flaviu Cimpan (refactor la navigația laterală), Zanfir Ovidius Stefan (Storybook
și configurarea de lint), Eugen Mihai și Andreea Ghiurcuta (setup inițial de proiect) — câteva
commituri fiecare.

> Pentru mentenanți: vă rog țineți această secțiune actualizată — vezi nota din documentația internă
> a proiectului.

---

## Licență

[MIT](LICENSE) © 2026 AdventTools and contributors. Liber de folosit, modificat și deployat pentru
propria ta biserică.
