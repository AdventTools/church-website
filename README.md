> **Limbă:** 🇷🇴 Română (aici) · 🇬🇧 [English](README.en.md)

# Site de biserică — un stack bilingv Next.js + Strapi

Un stack complet, gata de producție, **bilingv (RO/EN)** pentru site-ul unei biserici locale:
un front end rapid, optimizat SEO/AEO, pe [Next.js 15](https://nextjs.org), alimentat integral
de un CMS [Strapi 4](https://strapi.io) self-hosted — astfel încât editori fără cunoștințe tehnice
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
- **Galerie** — layout masonry cu lightbox (zoom, swipe, tastatură).
- **Integrare YouTube** — banner live + player încorporat când biserica transmite, plus o secțiune
  de predici recente (via RSS public; detecția live e opțională, prin Data API).
- **Formular de contact** — mesajele se trimit prin setările SMTP din CMS; parola SMTP stă doar
  pe server, niciodată în CMS/DB/API/browser.
- **Confidențialitate** — banner de consimțământ cookie (UE); Google Analytics se încarcă doar
  după accept.
- **Administrare prietenoasă** — brandul bisericii, etichete în română + text de ajutor, grupare
  logică, coloană de limbă compactă.

---

## Stack tehnic

| Nivel     | Tehnologie |
|-----------|------------|
| Front end | Next.js 15 (App Router, React 19), TypeScript, module SCSS |
| CMS       | Strapi 4.26, MySQL/MariaDB, plugin i18n |
| Rulare    | Node.js, self-hosted în spatele nginx + PM2 |
| E-mail    | Nodemailer (SMTP), proxat prin Strapi |

### Arhitectură

```
Browser
   │
   ▼
nginx (TLS, reverse proxy)
   │
   ├─────────────► Next.js 15  (frontend-next)  ── SSR/SSG, revalidare ISR
   │                     │  fetch server-side
   │                     ▼
   └─────────────► Strapi 4   (cmsstrapi)  ── API REST + panou de administrare
                         │
                         ▼
                   MySQL / MariaDB
```

Browserul comunică doar cu Next.js. Next.js aduce conținutul din Strapi pe server; formularul de
contact e proxat prin Strapi, așa că datele SMTP nu ajung niciodată la client.

---

## Structura proiectului

```
frontend-next/      front end Next.js 15
  src/config/site.ts   ← configurarea unică de identitate a bisericii (editează pentru rebrand)
  src/app/             pagini App Router ([lang]/…), sitemap, robots, manifest
  src/lib/             stratul de date Strapi, helperi SEO/JSON-LD, dicționarul i18n
  src/components/      componente UI
  .env.example         șablon de variabile de mediu pentru front end
cmsstrapi/          CMS Strapi 4
  src/api/             tipuri de conținut (event, project, article, smtp, …)
  src/admin/           personalizări ale panoului (branding, extensii)
  src/index.js         bootstrap idempotent (roluri, permisiuni, date de seed)
  src/seed/            conținut de exemplu (o biserică îl suprascrie din admin)
  config/              server / bază de date / plugin-uri / middlewares
  .env.example         șablon de variabile de mediu pentru CMS
```

---

## Cerințe

- **Node.js** 18–20 și **Yarn**
- **MySQL 8** sau **MariaDB 10.5+**

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

### 2. Front end (Next.js)

```bash
cd frontend-next
cp .env.example .env.local     # setează STRAPI_URL + NEXT_PUBLIC_SITE_URL
yarn install
yarn dev                       # http://localhost:3000
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
rezervă (fallback) când câmpul corespunzător din CMS e gol.

### Listă pentru rebranding

- [ ] `cp .env.example .env` în **ambele** aplicații și completează valorile reale
- [ ] Setează `NEXT_PUBLIC_SITE_URL` cu domeniul tău
- [ ] Editează `frontend-next/src/config/site.ts` (nume, coordonate, adresă, linkuri, slogan)
- [ ] Înlocuiește logo-ul/favicon-ul în `frontend-next/public/` și `cmsstrapi/src/admin/extensions/`
- [ ] În panoul Strapi, completează **church-info**, **contact**, **style** (culori), **program**
      și setările **E-mail (SMTP)** (inclusiv adresa destinatarului)
- [ ] Ajustează textele meta/descriptive editoriale din `frontend-next/src/lib/i18n.ts`
      (copywriting per pagină) și textele de rezervă pentru „ce credem"/galerie, dacă vrei
- [ ] Înlocuiește conținutul de seed (evenimente, proiecte, articole, „ce credem") din admin

---

## Deploy

Deployment-ul de referință rulează în spatele **nginx** (terminare TLS + reverse proxy), cu ambele
aplicații gestionate de **PM2**:

```bash
# CMS
cd cmsstrapi && yarn install && NODE_ENV=production yarn build
pm2 start "yarn start" --name church-strapi

# Front end
cd frontend-next && yarn install && yarn build
pm2 start "yarn start" --name church-web
```

nginx proxează domeniul public către portul Next.js și un subdomeniu `cms.` către Strapi.
Merge pe orice host Node (un VPS, sau platforme precum Vercel pentru front end + un Strapi găzduit).

---

## Contribuții

Issue-urile și pull request-urile sunt binevenite. Codul e în engleză; mesajele de commit folosesc
convenția `feat:` / `fix:` / `chore:` / `refactor:` / `docs:`.

---

## Contribuitori

Proiectul are două capitole. Între **2020 și 2025**, o echipă mică a construit și a întreținut
site-ul original al bisericii — o aplicație React + Express + Strapi pe Azure. În **2026** a fost
reconstruit de la zero în stack-ul actual, self-hosted, Next.js 15 + Strapi 4; fiecare linie de cod
din acest repository aparține acelui rebuild. Creditele de mai jos reflectă istoricul git la momentul
publicării open-source (551 de commituri, nov. 2020 – iul. 2026), ponderate după codul scris efectiv
de fiecare — lăsând deoparte codul adus gata făcut (framework-uri, dependințe, fișiere generate).

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
site-ul ca aplicația din acest repository: întregul front end Next.js 15 (strat de date Strapi tipizat,
SSR/SSG și fiecare pagină), CMS-ul Strapi 4 self-hosted cu întregul model de conținut al bisericii,
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
