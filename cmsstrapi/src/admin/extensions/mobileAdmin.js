// Face panoul Strapi utilizabil pe telefon (Strapi 4 e desktop-first).
// Pe ecrane mici: UN singur buton ☰ deschide UN sertar (stânga) care conține ambele meniuri
// Strapi — cel principal (sus) + lista contextuală de tipuri de conținut / secțiuni (jos).
// Conținutul rămâne full-width. Clasele Strapi sunt hashuite → marcăm structural, prin JS.

const CSS = `
.cmob-burger, .cmob-backdrop { display: none; }
@media (max-width: 768px) {
  .cmob-burger {
    display: flex; align-items: center; justify-content: center;
    position: fixed; top: 8px; left: 8px; z-index: 60; width: 40px; height: 40px; padding: 0;
    background: #fff; color: #32324d; border: 1px solid #dcdce4; border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,.12); cursor: pointer; font-size: 19px; line-height: 1;
  }
  .cmob-backdrop { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,.35); }
  html.cmob-open .cmob-backdrop { display: block; }

  /* Un singur sertar (stânga): meniul principal (sus) + sub-meniul (jos), stivuite */
  nav.cmob-main, nav.cmob-sub {
    position: fixed !important; left: 0; z-index: 55;
    width: 82vw !important; max-width: 300px !important; min-width: 0 !important;
    background: #fff; overflow-y: auto;
    transform: translateX(-100%); transition: transform .25s ease;
    box-shadow: 2px 0 20px rgba(0,0,0,.18);
  }
  html.cmob-open nav.cmob-main, html.cmob-open nav.cmob-sub { transform: none; }
  nav.cmob-main { top: 0; height: 46vh !important; border-bottom: 1px solid #eaeaef; }
  nav.cmob-sub  { top: 46vh; bottom: 0; height: auto !important; min-height: 0 !important; }
  /* Când nu există sub-meniu, meniul principal ocupă tot sertarul */
  html:not(.cmob-has-sub) nav.cmob-main { height: 100% !important; bottom: 0; border-bottom: 0; }

  /* Conținutul → full-width (meniurile sunt scoase din flux) */
  .cmob-cwrap { display: block !important; }
  .cmob-cwrap > * { width: 100% !important; min-width: 0 !important; }
  main { width: 100% !important; min-width: 0 !important; }

  /* Tabele late: scroll orizontal în containerul lor (mărginit la ecran) */
  .cmob-tscroll { overflow-x: auto !important; max-width: 100vw !important; }
  /* Bara de acțiuni din antet (Save/Unpublish) se înfășoară ca să rămână accesibilă */
  .cmob-hwrap { flex-wrap: wrap !important; row-gap: 8px !important; }

  body, #app { overflow-x: hidden !important; max-width: 100vw; }
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

function ensureChrome() {
  const html = document.documentElement;
  if (!document.querySelector('.cmob-burger')) {
    const b = document.createElement('button');
    b.className = 'cmob-burger';
    b.type = 'button';
    b.setAttribute('aria-label', 'Meniu');
    b.textContent = '☰';
    b.addEventListener('click', () => html.classList.toggle('cmob-open'));
    document.body.appendChild(b);
  }
  if (!document.querySelector('.cmob-backdrop')) {
    const bd = document.createElement('div');
    bd.className = 'cmob-backdrop';
    bd.addEventListener('click', () => html.classList.remove('cmob-open'));
    document.body.appendChild(bd);
  }
}

// Marchează structural bara principală, sub-meniul, containerul de conținut, tabelele și antetul.
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

  document.querySelectorAll('main table').forEach((t) => {
    if (t.parentElement) t.parentElement.classList.add('cmob-tscroll');
  });

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
    document.documentElement.classList.remove('cmob-open');
  }
}

export function initMobileAdmin() {
  if (typeof document === 'undefined' || typeof window === 'undefined' || !window.matchMedia) return;
  // Gard strict: pe DESKTOP (>768px) nu injectăm și nu observăm NIMIC — panoul rămâne neatins.
  const mql = window.matchMedia('(max-width: 768px)');
  let mo = null;

  const activate = () => {
    ensureStyle();
    ensureChrome();
    tag();
    if (!mo) {
      mo = new MutationObserver(() => {
        ensureChrome();
        tag();
        watchRoute();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  };
  const deactivate = () => {
    if (mo) { mo.disconnect(); mo = null; }
    document.documentElement.classList.remove('cmob-open', 'cmob-has-sub');
    document.querySelectorAll('.cmob-burger, .cmob-backdrop').forEach((e) => e.remove());
  };
  const apply = () => (mql.matches ? activate() : deactivate());
  const start = () => {
    apply();
    mql.addEventListener('change', apply);
  };
  if (document.body) start();
  else window.addEventListener('DOMContentLoaded', start);
}
