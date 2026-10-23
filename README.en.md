> **Language:** 🇷🇴 [Română](README.md) · 🇬🇧 English (this page)

# Church Website — a bilingual Next.js + Strapi stack

A production-ready, **bilingual (RO/EN)** website stack for a local church: a fast,
SEO/AEO-optimized [Next.js 16](https://nextjs.org) front end driven entirely by a
self-hosted [Strapi 5](https://strapi.io) CMS, so non-technical editors manage all
content from a friendly admin panel.

Built for and running in production at **[adventistcluj.ro](https://adventistcluj.ro)**
(Biserica Adventistă „Speranța" Cluj-Napoca), and designed so **any church can reuse it
as a stack** — copy it, set a few environment variables, fill in the CMS, and edit one
config file to rebrand.

> **🌐 Live example:** **[adventistcluj.ro](https://adventistcluj.ro)** — a complete church
> website running on this exact stack. See how it looks and works in the real world.

---

## Features

- **Bilingual by design** — Romanian at the root, English under `/en`, with per-item
  fallback so content entered in one language still shows in the other. `hreflang`,
  localized Open Graph, bilingual sitemap.
- **Everything editable from the CMS** — pages, events, projects, blog, beliefs, gallery,
  program/schedule, contact info, brand colors, SMTP — all Strapi single/collection types.
- **SEO & AEO first** — rich JSON-LD (`Church`/`PlaceOfWorship`, `WebSite`, `Event`,
  `VideoObject`, `FAQPage`, `BreadcrumbList`), canonical + hreflang per page, `sitemap.xml`,
  `robots.txt`, Speakable, Open Graph/Twitter.
- **Events** — upcoming vs. archive, clean slug URLs with 301 redirects for old links,
  reusable **event templates** (apply a template to pre-fill a new event), per-day duplicate
  warnings, and granular editor roles (per-project + own-events collaborators).
- **Blog** — rich text + images from the CMS, auto-rendered with typographic styling.
- **Gallery** — a `/galerie` page with two entries, photos and video. **Photo albums by topic**
  (Baptisms, Concerts, Camps… — topics are defined in the admin, with RO + EN names), each album
  with its own page, in justified rows that keep every photo's proportions, with a lightbox
  (zoom, swipe, keyboard). An album can be linked to an event: the event page then shows "See the
  photos". Until the first album exists, the photos of the old gallery ("Gallery" in the admin) show here instead. **YouTube videos** picked in the admin, grouped by topic, with one featured on top;
  the player loads only on "play", from the no-cookie domain. The About page keeps 4 photos
  that lead to the gallery. `ImageGallery` / `VideoObject` JSON-LD, sitemap with images.
- **YouTube integration** — live banner + embedded player when the church is streaming,
  plus a recent-sermons section (via public RSS; live detection optional via the Data API).
  The same broadcasts also appear on the gallery's Video page, below the picked videos.
- **Morning thought** — short devotionals (verse + reflection) written in the admin, RO/EN,
  with their own pages and a paginated archive. Optionally, **today's thought** from the public
  Sola Scriptura feed (Romanian) appears above them and on the home page, with the feed's last
  ~30 days, each linking to its source; switch it off in `site.ts` (`dailyThoughts`).
- **Bank-transfer donations (optional)** — the `/donatii` page (`/en/donatii`), built for
  phones: the church shows a QR code to it in the hall, and people copy the beneficiary, the
  IBAN (shown in groups of 4, copied without spaces) and the "Payment details" text with one tap
  each, then pay from their banking app. Filled in from the admin (**Donații**: beneficiary,
  IBAN, bank, currency, default "Payment details" text, thank-you message; texts in RO + EN).
  The default text may stay empty: the field then has no copy button and the page asks the donor
  to write their own purpose.
  Without an IBAN the page returns 404 and is left out of the sitemap and the footer; it never
  appears in the main menu. For the QR code use the unprefixed address, `https://your-domain/donatii`.
- **Contact form** — messages sent through the CMS's SMTP settings; the SMTP password lives
  only on the server, never in the CMS/DB/API/browser.
- **Privacy** — EU cookie-consent banner; Google Analytics loads only after consent.
- **Friendly admin** — church branding, Romanian field labels + help text, logical grouping,
  edit-view side panels (SMTP test, duplicate-event warning, "Apply a template") and a
  usable mobile admin.
- **E-mail invitations** — Strapi does not e-mail a colleague you invite to the admin (it only
  shows a link to copy). Here the link goes out automatically, through the admin's SMTP
  settings, and **Settings → Site → Invitații** lists pending invitations with "Resend" and
  "Copy link".

---

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Front end | Next.js 16 (App Router, React 19), TypeScript, SCSS modules |
| CMS       | Strapi 5.58 (i18n in core), MySQL/MariaDB |
| Runtime   | Node.js, self-hosted behind nginx + PM2 |
| Email     | Nodemailer (SMTP), proxied through Strapi |

### Architecture

```
Browser
   │
   ▼
nginx (TLS, reverse proxy)
   │
   ├─────────────► Next.js 16  (frontend-next)  ── SSR/SSG, ISR revalidation
   │                     │  server-side fetch
   │                     ▼
   └─────────────► Strapi 5   (cmsstrapi)  ── REST API + admin panel
                         │
                         ▼
                   MySQL / MariaDB
```

The browser only ever talks to Next.js. Next.js fetches content from Strapi server-side;
the contact form is proxied through Strapi so SMTP credentials never reach the client.

---

## Repository structure

```
frontend-next/      Next.js 16 front end
  src/config/site.ts   ← single church-identity config (edit to rebrand)
  src/app/             App Router pages ([lang]/…), sitemap, robots, manifest
  src/app/api/         proxy routes (contact form, YouTube live detection)
  src/proxy.ts         bilingual RO/EN routing
  src/lib/             Strapi data layer, SEO/JSON-LD helpers, i18n dictionary
  src/components/      UI components
  next.config.ts       Next.js configuration
  .env.example         front-end environment template
cmsstrapi/          Strapi 5 CMS
  src/api/             content types (event, project, article, smtp, …)
  src/admin/           admin panel customizations (branding, extensions)
  src/components/      reusable content components
  src/index.js         idempotent bootstrap (roles, permissions, seed data)
  src/admin-views.js   admin field labels, grouping and hiding
  src/delegate-roles.js delegated roles (event collaborator, project lead)
  src/invitations.js   automatic e-mailing of admin invitations
  src/seed/            example seed content (a church overwrites it from the admin)
  scripts/             command-line tools (see below)
  config/              server / database / plugins / middlewares
  .env.example         CMS environment template
```

### Scripts (from `cmsstrapi/`)

| Script | What it is for |
|---|---|
| `node scripts/set-smtp.js --host … --port 587 --username … --password '…' --from-name '…' --from-email … --to …` | first e-mail setup from the terminal; afterwards it is changed from the admin. The password is stored encrypted, as with the admin button |
| `node scripts/test-smtp.js [--send address@example.org]` | checks the SMTP connection and login without a browser; with `--send`, sends a test message along the password-reset path |
| `node scripts/resend-invitation.js [--link\|--send address]` | lists pending invitations, shows a colleague's link or resends it |
| `node scripts/generate-icons.js --logo emblem.svg --color '#rrggbb' [--wordmark logo.png] [--name '…'] [--tagline '…'] [--out dir]` | regenerates the favicons, app icons and the sharing image (Open Graph) from the church's emblem |

The scripts start Strapi in the background, so they need the same `.env` and the database.

---

## Prerequisites

- **Node.js 24 LTS** (recommended, tested on 24.22.1; 22 still works and is the minimum `cmsstrapi` accepts). Next.js 16 requires at least 20.9; Strapi 5 is officially supported on Node 22/24/26. Production runs Node 22.23.1.
- **npm** for `frontend-next` (`package-lock.json`) and **Yarn** for `cmsstrapi` (`yarn.lock`)
- **MySQL 8.0+** or **MariaDB 10.3+** (Strapi 5's documented minimum; MariaDB 11.4 recommended; production runs 10.11)

---

## Quick start (local development)

### 1. CMS (Strapi)

```bash
cd cmsstrapi
cp .env.example .env          # then fill in secrets + DB credentials
yarn install
yarn develop                  # http://localhost:1337/admin
```

Generate the required secrets (`APP_KEYS`, `*_SALT`, `*_SECRET`) with `openssl rand -base64 32`.
On first boot the bootstrap seeds example content and configures roles/permissions.
Create your admin account, then edit the content to match your church.

The port comes from `PORT` in `.env` (the example sets it to 1337). Without it, Strapi tries port 80.

### 2. Front end (Next.js)

```bash
cd frontend-next
cp .env.example .env.local     # set STRAPI_URL + NEXT_PUBLIC_SITE_URL
npm ci
npm run dev                    # http://localhost:3000
```

---

## Configuration — three clear layers

Nothing church-specific is scattered through the code. To make this stack your own, you only
touch three places:

**1. `.env` — secrets & per-deployment settings** (never committed; see the two `.env.example`
files). Database, Strapi security keys, `SMTP_PASSWORD`, `MAIL_PROXY_TOKEN`, your public site
URL, Google Analytics ID, and YouTube keys.

**2. The Strapi admin — live content.** Church name, address, phone, email, pastor, social
links, brand colors, the program/schedule, pages, events, projects, blog, gallery — all edited
from the panel. This is where a reusing church spends most of its time.

**3. `frontend-next/src/config/site.ts` — identity & SEO fallbacks.** One well-commented file
holding the values that are neither secret nor day-to-day content: GPS coordinates (used for
JSON-LD and the sunset/Sabbath time), structured postal address, founding year, SEO keywords,
denominational footer links, slogan. These are the fallbacks used when the matching CMS field
is empty. Here too, `dailyThoughts` switches today's thought from Sola Scriptura on or off.

### Rebrand checklist

- [ ] `cp .env.example .env` in `cmsstrapi` and `cp .env.example .env.local` in `frontend-next`, then fill in real values
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your domain
- [ ] Edit `frontend-next/src/config/site.ts` (name, coordinates, address, links, slogan)
- [ ] Replace the logo in `frontend-next/public/` and `cmsstrapi/src/admin/extensions/`, then
      regenerate the icons and sharing image with `node scripts/generate-icons.js` (from `cmsstrapi/`)
- [ ] In the Strapi admin, fill in **church-info**, **contact**, **style** (colors), **program**,
      and the **E-mail (SMTP)** settings (recipient address included)
- [ ] Optionally, fill in and publish **Donații** (the IBAN turns on the `/donatii` page)
- [ ] Adjust the editorial meta/description strings in `frontend-next/src/lib/i18n.ts`
      (per-page marketing copy) and the beliefs/gallery fallback text if desired
- [ ] Replace the seed content (events, projects, articles, beliefs) from the admin and adjust
      the gallery topics (**Temă galerie**)

---

## Deployment

The reference deployment runs behind **nginx** (TLS termination + reverse proxy) with both
apps managed by **PM2**:

```bash
# CMS
cd cmsstrapi && yarn install && NODE_ENV=production yarn build
pm2 start "yarn start" --name church-strapi

# Front end
cd frontend-next && npm ci && npm run build
pm2 start ./node_modules/next/dist/bin/next --name church-web -- start -H 127.0.0.1 -p 3000
```

nginx proxies your public domain to the Next.js port and a `cms.` subdomain to Strapi.
Any Node host works (a VPS).

---

## Contributing

Issues and pull requests are welcome. Identifiers are in English; comments are mostly in
Romanian — both are accepted. Commit messages use the `feat:` / `fix:` / `chore:` / `refactor:` /
`docs:` convention.

---

## Contributors

This project has two chapters. From **2020 to 2025** a small team built and ran the original
church website — a React + Express + Strapi application on Azure. In **2026** it was rebuilt from
the ground up into the current self-hosted Next.js 16 + Strapi 5 stack; every line of code in
this repository belongs to that rebuild. The credits below reflect the git history at the time
of open-sourcing (551 commits, Nov 2020 – Jul 2026), weighted by the code each person actually
wrote — setting aside brought-in framework code, dependencies and generated files.

The full git history (2020-2026) is not published in this repository — the history visible here
starts at the point of open-sourcing, with a single author. The figures below come from the
original private repository.

**Toma Becea** — founder and lead developer, and by far the largest contributor (~359 commits
over more than four years). He started the project and carried it almost single-handedly: the
Azure infrastructure-as-code (Terraform for App Service, MySQL, container registry, DNS, TLS and
storage), the GitHub Actions CI/CD pipelines, the Strapi CMS setup and its long chain of version
upgrades, and the React front end together with the Express reverse-proxy layer and the YouTube
live integration. A very large body of sustained work.

**Melania Bartha** (Betty Melania) — core front-end developer (~95 commits). She built the
React/TypeScript foundation (router, components, API and utility layers, lint tooling),
Google/Facebook authentication, the navigation and layout (menu, footer, mobile sidebar), the
home-page event carousel, the program/schedule feature, and the About, gallery and contact
pages, along with a good deal of the Strapi content types.

**Samy Balasa** — architect and sole developer of the current stack (~51 commits). He rebuilt
the site as the application in this repository: the complete Next.js 16 front end (typed Strapi
data layer, SSR/SSG, and every page), the self-hosted Strapi 5 CMS and its full church content
model, the bilingual RO/EN system with per-item fallback, the SEO/AEO layer (JSON-LD, canonical,
sitemap), the events subsystem (reusable templates, editor roles, archive logic and clean-slug
redirects), the blog, gallery and music modules, and the contact form with SMTP hardening and
cookie-consent privacy. The earlier React/Express app was retired during the migration, so this
is a full ground-up rebuild rather than an extension of the previous code.

**Victor Greavu** — front-end contributor (~39 commits, most of them small). Mobile-menu scroll
behaviour, CSS/SCSS visual polish, and the SVG header logo and favicon.

**Also contributed:** Flaviu Cimpan (side-navigation refactor), Zanfir Ovidius Stefan (Storybook
and linting setup), Eugen Mihai and Andreea Ghiurcuta (early project setup) — a few commits each.

> Maintainers: please keep this section up to date — see the note in the project's internal docs.

---

## License

[MIT](LICENSE) © 2026 AdventTools and contributors. Free to use, modify and deploy for your
own church.
