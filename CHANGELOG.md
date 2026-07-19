# Changelog

## 2026-07-19 (7)
- fix(mobile): meniul mobil se deschidea ca o pagină albă goală — token-urile CSS (`--ease-spring`, `--ink`, `--row-scrolled`) erau definite pe `.header`, dar overlay-ul meniului e frate cu `<header>`, nu descendent, deci nu le moștenea; `var(--ease-spring)` invalida animația → linkurile rămâneau `opacity:0`. Redeclarate token-urile pe `.mobileMenu`. Verificat cu render real pe mobil.

## 2026-07-19 (6)
- chore(oss): pregătire pentru publicare open-source (github.com/AdventTools, refolosibil de orice biserică)
- refactor(config): toată identitatea specifică bisericii centralizată în `frontend-next/src/config/site.ts` (un singur fișier de rebrand); `seo`/`jsonld`/`utils`/Header/Footer/manifest/layout citesc de acolo
- fix(privacy): scoase emailurile personale hardcodate + numele bisericii din schema SMTP (destinatarul se setează din CMS); redactate emailurile din CHANGELOG
- chore(cleanup): șterse artefactele moarte pre-migrare (Terraform Azure `infra/`, 8 workflow-uri Azure, `web.dockerfile`, diagrame `docs/arch`, `.vscode/launch.json`); `tpm/` scos de sub git
- docs: `.env.example` pentru ambele aplicații; `.gitignore` robust (env/secrete); README rescris complet (setup, deploy, rebrand + sumar contribuitori echilibrat)
- feat(cms): coloana i18n din listă compactă — antet „Limba" + doar codul limbii (RO, EN)

## 2026-07-19 (5)
- feat(events): șabloane de evenimente COMPLETE (Sfânta Cină / Invitat / Botez / AMiCUS) — cu texte reale + imagine de copertă implicită (generată, în brand), RO+EN, editabile de editori; dropdown „Aplică un șablon" mutat în bara de sus a evenimentului (vizibil imediat) — precompletează câmpurile (cele goale rămân neatinse); după aplicare se poate edita orice
- feat(events): evenimentele fără detalii (fără rezumat/descriere/imagine/locație) NU mai sunt clickabile — rămân doar în listă; pe prima pagină apar ca elemente compacte (nu carduri mari cu poză goală)
- content: traduse în engleză cele 3 evenimente adăugate doar în română (Sfânta Cină, Invitat, Sabat aniversar)
- fix(copy): text „ce urmează" mai natural, „biserică" în loc de „comunitate"

## 2026-07-19 (4)
- feat(url): la schimbarea unui slug, vechiul URL se păstrează în `oldSlugs` → redirect 301 automat (nu se pierd linkuri). Ex: /proiecte/muzica-si-inchinare → /proiecte/muzica
- feat(projects): proiecte universalizate — „Secțiuni” generice (orice proiect poate avea descriere + persoane cu etichetă proprie + videouri + galerie foto). Câmpul „order” eliminat (ordinea e aleatoare)
- feat(roles): rol „Colaborator evenimente” (vede toate, editează doar ale lui) + câte un rol „Responsabil: <Proiect>” per proiect (editează doar acel proiect + evenimente proprii, cu condiție custom per-proiect)
- feat(cms): avertisment „eveniment duplicat în aceeași zi” în ecranul de editare a evenimentului; etichete RO + ajutor și pe câmpurile componentelor (secțiuni, videouri, persoane)
- fix(seed): populare o singură dată (rename-proof) — redenumirea unui proiect nu mai creează duplicat. Eliminat duplicatul „Muzică și închinare” apărut din acest motiv
- fix(ui): footer mai compact (liste pe 2 coloane, spațiere redusă)

## 2026-07-19 (3)
- fix(slug): editarea titlului NU mai schimbă URL-ul (slug generat doar la creare) — repara problema de la redenumirea „Muzică”. Cache pagini redus la 60s (modificările din admin apar în ~1 minut, nu 1 oră)
- feat(cms): ecrane de editare prietenoase — etichete în română + text de ajutor pe fiecare câmp + grupare logică + ascunderea câmpului tehnic „slug”. Evenimentul simplificat (fără „type”, câmpuri de locație opționale = „doar dacă NU e la biserică”)
- chore: eliminat câmpul „type” de la evenimente și „order” de la proiecte (ordinea e oricum aleatoare). Destinatar nou pentru formularul de contact (configurabil din CMS)
- feat(ui): meniu reordonat logic (Program · Evenimente · Proiecte · Blog · Contact); footer reproiectat (mai compact, bloc identitate + adresă + social); proiectele de pe prima pagină se rotesc la refresh; „Corul bisericii” → etichetă „Dirijori de-a lungul timpului”
- feat(home): la Program se afișează doar Vineri + Sâmbătă + un rând elegant „Următorul program” cu ora (calculat din ora reală a vizitatorului)

## 2026-07-19 (2)
- fix(music): videourile aparțin acum FIECĂREI formații (nested în „ensemble"), nu unei liste globale legate prin „grup" — corul/Echo/soliștii își au propriile clipuri, intuitiv în CMS. Migrare unică a datelor + câmp global „videos" și „grup" (redundant) eliminate
- chore(cms): favicon-ul panoului de administrare = emblema site-ului, în alb-negru
- fix(smtp): parola SMTP mutată din CMS în variabila de mediu `SMTP_PASSWORD` (server, gitignored) — nu mai e vizibilă nicăieri: câmpul scos din content-type, coloana ștearsă din DB, absentă din API. TLS ales automat după port (465/587). Formular contact testat end-to-end (livrare OK)
- feat(roles): Editor și Author gestionează TOATE content-type-urile (creare/citire/editare/ștergere/publicare; Author doar conținut propriu, fără publicare) — mai puțin contul SMTP, care rămâne doar la Super Admin. Bootstrap idempotent, acoperă și tipurile viitoare. Fără acces la Setări pentru Editor/Author
- feat(home): sumar evenimente pe prima pagină (viitoare sau, dacă lipsesc, recente din arhivă) cu buton „Vezi toate evenimentele"

## 2026-07-19
- feat(url): linkuri curate cu slug (`/proiecte/amicus` în loc de `/proiecte/7-amicus`), partajate RO↔EN, cu redirect 301 de pe URL-urile vechi numerice; slug auto-generat din titlu (lifecycle) + editabil din CMS
- fix(i18n): reparat 404 pe paginile EN de detaliu (proiecte/evenimente/blog) — rezolvare după slug+limbă cu fallback pe RO; hreflang pe slug partajat
- feat(cms): audit Strapi aplicat — slug pe proiecte/evenimente/articole, nume+descrieri RO pe 10 content-types, `order` la Istoric, `title` la video, format hex la culori, tipuri media restrânse la imagini, harta de contact reparată (richtext→text + curățare date), regex prea strict scos de pe Facebook link, legătură RO↔EN „Ce credem", newline-uri reale în „Cine suntem" EN
- feat(ui): meniu „Despre noi" lizibil peste poze (text închis pe panou alb), Muzică & închinare cu 2 clipuri unul lângă altul (tot aleator), pagina Evenimente cu viitoare/trecute separate vizual + „vezi mai multe"
- feat(home): „Cine suntem" + card „Ce credem" (teaser cu „citește mai mult") în coloana din dreapta
- chore: șterse folderele vechi `backend/` + `frontend/` (aplicația pre-migrare, sursa problemelor de securitate din audit)

## 2026-07-18
- feat(aeo): AEO extrem — structured data îmbogățit (Church PlaceOfWorship cu contactPoint/employee/knowsLanguage/foundingDate/areaServed, tipizare WebPage/AboutPage/ContactPage/CollectionPage, servicii recurente Schedule pe /program, Speakable, Person pastor)
- feat(blog): blog editabil din CMS cu editor rich (text formatabil + poze din bibliotecă), randat automat cu tipografie „prose"; /blog + articole bilingve, BlogPosting JSON-LD
- feat(projects): secțiune „Proiecte" (Din grijă pentru tine, Masa caldă, AMiCUS) bilingvă cu pagini proprii de detalii; locație editabilă din CMS pe evenimente (folosită în Event JSON-LD)
- fix(ui): bara utilitară „Următorul program" DINAMIC (cel mai apropiat din orar, cu nume) — nu mai „slujbă"/sâmbătă hardcodat; secțiuni Proiecte + Blog pe homepage
- fix(seo): audit SEO/AEO adversarial (workflow) + reparații — comutator limbă RO reparat (nu mai /en/ro→404), descriere meta home RO corectată (era timestamp), hreflang evenimente reciproc pe perechea reală RO↔EN + 404 pe URL-uri fantomă, next/image pe copertă (anti-CLS), skip-link uniform, ierarhie headings, a11y/i18n (aria, alt, form required), og:site_name/description localizate EN
- feat(privacy): banner cookie consent UE (RO/EN) — Google Analytics se încarcă DOAR după accept (gated pe `NEXT_PUBLIC_GA_ID`); user Super Admin creat în Strapi
- feat(i18n): site bilingv RO+EN — RO la rădăcină, EN la /en (rutare `app/[lang]` + middleware), selector RO·EN în header, hreflang ro/en/x-default + canonical per pagină, sitemap bilingv; tot textul tradus (interfață via dicționar + conținut CMS via Strapi i18n cu fallback RO); date/zile localizate. Fix: middleware forțează http pe rewrite (proxy https→server http dădea 500)
- feat(email): SMTP configurabil integral din CMS (host/port/user/parolă/from/destinatar) + buton „Trimite e-mail de test" în panou; formularul de contact trece prin Strapi (parola nu ajunge niciodată în browser), token intern între Next↔Strapi, honeypot anti-spam; mesajele merg la adresa configurată în CMS
- feat(prima-vizita): pagină nouă „Prima ta vizită" editabilă din CMS (intro, carduri highlight cu iconițe, întrebări frecvente) — răspunde newcomerilor (program, parcare, ținută, copii, limbă), FAQPage + BreadcrumbList JSON-LD, bandă „ești nou?" pe homepage, link în meniu și footer
- feat(youtube): integrare LIVE + predici pe site — banner + player încorporat când e live (detecție eficientă via RSS + videos.list), secțiune „Transmisiuni recente" cu redare în modal (lite-embed rapid), JSON-LD VideoObject pentru SEO/AEO
- feat(ui): hero viu (imagine optimizată + Ken Burns + gradient de brand + săgeată scroll), next/image AVIF/WebP peste tot, scroll-reveal la secțiuni, micro-interacțiuni pe carduri
- feat(gallery): galerie masonry modernă cu lightbox (zoom, swipe pe telefon, tastatură, contor), alt text pentru SEO
- fix(program): corectat orele — Vineri 20:00, Serviciu Divin Sâmbătă seara 18:00
- content: recuperate toate cele 38 de fotografii reale în galerie din sursa veche
