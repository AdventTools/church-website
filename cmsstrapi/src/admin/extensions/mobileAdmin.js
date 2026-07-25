// Face panoul Strapi utilizabil pe telefon (Strapi 4 e desktop-first).
// Pe ecrane mici conținutul e mereu full-width; cele două meniuri devin sertare:
//   ☰ stânga  = meniul principal (Content Manager, Media Library, Settings…)
//   ▤ dreapta = sub-meniul contextual (lista de tipuri de conținut / secțiuni Setări)
// Clasele Strapi sunt hashuite, așa că marcăm elementele structural prin JS.

const CSS = `
.cmob-burger, .cmob-backdrop { display: none; }
@media (max-width: 768px) {
  .cmob-burger {
    display: flex; align-items: center; justify-content: center;
    position: fixed; top: 8px; z-index: 60; width: 40px; height: 40px; padding: 0;
    background: #fff; color: #32324d; border: 1px solid #dcdce4; border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,.12); cursor: pointer; font-size: 19px; line-height: 1;
  }
  .cmob-burger-main { left: 8px; }
  .cmob-burger-sub  { right: 8px; }
  html:not(.cmob-has-sub) .cmob-burger-sub { display: none; }

  .cmob-backdrop { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,.35); }
  html.cmob-open .cmob-backdrop, html.cmob-sub-open .cmob-backdrop { display: block; }

  /* Sertar stânga: meniul principal */
  nav.cmob-main {
    position: fixed !important; top: 0; left: 0; bottom: 0; z-index: 55;
    width: 82vw !important; max-width: 300px !important;
    transform: translateX(-100%); transition: transform .25s ease;
    box-shadow: 2px 0 20px rgba(0,0,0,.18); background: #fff; overflow-y: auto;
  }
  html.cmob-open nav.cmob-main { transform: none; }

  /* Sertar dreapta: sub-meniul contextual. Închis = display:none (un element
     fixed mutat off-screen la dreapta NU e tăiat de overflow-x și ar lăți pagina). */
  nav.cmob-sub {
    position: fixed !important; top: 0; right: 0; bottom: 0; z-index: 55;
    width: 82vw !important; max-width: 320px !important; min-width: 0 !important;
    height: auto !important; min-height: 100%; display: none !important;
    box-shadow: -2px 0 20px rgba(0,0,0,.18); background: #fff; overflow-y: auto;
  }
  html.cmob-sub-open nav.cmob-sub { display: block !important; }

  /* Conținutul → full-width (sub-meniul iese din flux, deci se poate extinde) */
  .cmob-cwrap { display: block !important; }
  .cmob-cwrap > * { width: 100% !important; min-width: 0 !important; }
  main { width: 100% !important; min-width: 0 !important; }

  /* Tabelele late scrollează pe orizontală în containerul lor (mărginit la ecran) */
  .cmob-tscroll { overflow-x: auto !important; max-width: 100vw !important; }

  /* Rândurile din antet care dau overflow (titlu + butoane Save/Unpublish) se înfășoară */
  .cmob-hwrap { flex-wrap: wrap !important; row-gap: 8px !important; }

  /* Fără scroll orizontal; barele de sus se pot înfășura; loc pentru butoane */
  body, #app { overflow-x: hidden !important; max-width: 100vw; }
  #app [class*="Flex"], #app header { flex-wrap: wrap; }
  main [class*="HeaderLayout"] { padding-top: 48px; }
}
`;

function ensureStyle() {
  if (document.getElementById('cmob-style')) return;
  const s = document.createElement('style');
  s.id = 'cmob-style';
  s.textContent = CSS;
  document.head.appendChild(s);
}

function mkBtn(cls, label, aria, onClick) {
  if (document.querySelector('.' + cls)) return;
  const b = document.createElement('button');
  b.className = 'cmob-burger ' + cls;
  b.type = 'button';
  b.setAttribute('aria-label', aria);
  b.textContent = label;
  b.addEventListener('click', onClick);
  document.body.appendChild(b);
}

function ensureChrome() {
  const html = document.documentElement;
  mkBtn('cmob-burger-main', '☰', 'Meniu principal', () => {
    html.classList.toggle('cmob-open');
    html.classList.remove('cmob-sub-open');
  });
  mkBtn('cmob-burger-sub', '▤', 'Sub-meniu', () => {
    html.classList.toggle('cmob-sub-open');
    html.classList.remove('cmob-open');
  });
  if (!document.querySelector('.cmob-backdrop')) {
    const bd = document.createElement('div');
    bd.className = 'cmob-backdrop';
    bd.addEventListener('click', () => html.classList.remove('cmob-open', 'cmob-sub-open'));
    document.body.appendChild(bd);
  }
}

// Marchează bara principală, sub-meniul și containerul lor (la fiecare re-randare SPA).
function tag() {
  const main = document.querySelector('nav:not([aria-label])');
  if (main) main.classList.add('cmob-main');
  let hasSub = false;
  document.querySelectorAll('nav[aria-label]').forEach((n) => {
    const al = n.getAttribute('aria-label');
    if (al && al !== 'Pagination' && n.offsetWidth > 140 && !n.classList.contains('cmob-main')) {
      n.classList.add('cmob-sub');
      if (n.parentElement) n.parentElement.classList.add('cmob-cwrap');
      hasSub = true;
    }
  });
  document.documentElement.classList.toggle('cmob-has-sub', hasSub || !!document.querySelector('nav.cmob-sub'));
  // Tabelele late: containerul lor scrollează pe orizontală (nu umflă pagina).
  document.querySelectorAll('main table').forEach((t) => {
    if (t.parentElement) t.parentElement.classList.add('cmob-tscroll');
  });
  // Bara de acțiuni din antet: înfășoară ancestrii flex care depășesc lățimea (clase hashuite → JS).
  const h1 = document.querySelector('main h1');
  if (h1) {
    let el = h1.parentElement;
    for (let i = 0; i < 6 && el; i++) {
      const cs = getComputedStyle(el);
      if (cs.display === 'flex' && el.scrollWidth > el.clientWidth + 2) el.classList.add('cmob-hwrap');
      el = el.parentElement;
    }
  }
}

let lastPath = location.pathname;
function watchRoute() {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    document.documentElement.classList.remove('cmob-open', 'cmob-sub-open');
  }
}

export function initMobileAdmin() {
  if (typeof document === 'undefined') return;
  const boot = () => {
    ensureStyle();
    ensureChrome();
    tag();
    const mo = new MutationObserver(() => {
      ensureChrome();
      tag();
      watchRoute();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) boot();
  else window.addEventListener('DOMContentLoaded', boot);
}
