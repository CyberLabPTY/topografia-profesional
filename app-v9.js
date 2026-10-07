const cfg = window.SITE_CONFIG || {};

// Capa visual v10: se carga aparte para no inflar el CSS base ni bloquear la navegación.
(() => {
  if (document.querySelector('link[data-v10="topografia"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './enhancements-v10.css?v=10';
  link.dataset.v10 = 'topografia';
  document.head.appendChild(link);
})();

const nav = document.getElementById('siteNav');
const menu = document.querySelector('.menu-btn');
const shade = document.querySelector('.nav-shade');
const header = document.querySelector('.site-header');
const jumpLinks = [...document.querySelectorAll('a.jump-link[href^="#"]')];

function setMenu(open) {
  nav?.classList.toggle('open', open);
  shade?.classList.toggle('show', open);
  menu?.setAttribute('aria-expanded', String(open));
  menu?.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
}

menu?.addEventListener('click', () => setMenu(!nav?.classList.contains('open')));
shade?.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});

// Navegación instantánea y compatible con Atrás/Adelante del navegador.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

function sectionIdFromHash(hash = location.hash) {
  return hash && hash.length > 1 ? hash : '#inicio';
}

function setActiveSection(hash) {
  const current = sectionIdFromHash(hash);
  jumpLinks.forEach(link => {
    const active = link.getAttribute('href') === current;
    link.classList.toggle('section-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function jumpTo(hash) {
  const id = sectionIdFromHash(hash);
  const target = document.querySelector(id);
  if (!target) return false;
  const headerHeight = header?.getBoundingClientRect().height || 0;
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight - 2);
  window.scrollTo({ top, left: 0, behavior: 'auto' });
  setActiveSection(id);
  return true;
}

jumpLinks.forEach(link => {
  link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    if (!hash || !document.querySelector(hash)) return;
    event.preventDefault();
    setMenu(false);

    const currentHash = sectionIdFromHash(location.hash);
    if (currentHash !== hash) {
      history.pushState({ section: hash }, '', hash);
    }
    jumpTo(hash);
  });
});

window.addEventListener('popstate', () => {
  setMenu(false);
  requestAnimationFrame(() => jumpTo(sectionIdFromHash(location.hash)));
});

// El estado inicial queda identificado, pero no se crea una entrada extra.
if (!history.state || !history.state.section) {
  history.replaceState({ section: sectionIdFromHash(location.hash) }, '', location.href);
}
window.addEventListener('load', () => {
  if (location.hash) requestAnimationFrame(() => jumpTo(location.hash));
  else setActiveSection('#inicio');
});

// Mantiene la sección activa al desplazarse manualmente sin escribir en el historial.
const sections = [...document.querySelectorAll('.section-anchor[id]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveSection(`#${visible.target.id}`);
  }, { rootMargin: '-24% 0px -58% 0px', threshold: [0.01, 0.15, 0.35] });
  sections.forEach(section => sectionObserver.observe(section));
}

// Convierte la escena frontal en una lectura instrumental más profesional.
const fieldScene = document.querySelector('.field-scene');
const station = document.querySelector('.field-scene .station');
if (station && !station.querySelector('.station-base-v10')) {
  station.insertAdjacentHTML('beforeend', '<span class="station-base-v10" aria-hidden="true"></span><span class="station-keypad-v10" aria-hidden="true"></span>');
}

if (fieldScene && !fieldScene.querySelector('.survey-hud')) {
  fieldScene.insertAdjacentHTML('beforeend', `
    <div class="survey-reticle" aria-hidden="true"><i></i><b></b></div>
    <div class="metric-baseline" aria-hidden="true"><span>HD 42.381 m</span></div>
    <section class="survey-hud" aria-label="Lectura técnica ilustrativa de estación total">
      <div class="hud-main">
        <div class="hud-head"><strong>ESTACIÓN TOTAL · MODO MEDICIÓN</strong><span>Visualización técnica ilustrativa</span></div>
        <div class="hud-grid">
          <div class="hud-metric"><small>Hz</small><b>128°34′22″</b></div>
          <div class="hud-metric"><small>V</small><b>91°12′08″</b></div>
          <div class="hud-metric"><small>SD</small><b>42.386 m</b></div>
          <div class="hud-metric"><small>HD</small><b>42.381 m</b></div>
          <div class="hud-metric"><small>ΔH</small><b>+0.642 m</b></div>
        </div>
      </div>
      <div class="hud-side">
        <div class="hud-coordinate"><small>N</small><b>998456.220</b></div>
        <div class="hud-coordinate"><small>E</small><b>661024.890</b></div>
        <div class="hud-coordinate"><small>Z</small><b>124.800 m</b></div>
        <div class="hud-coordinate"><small>HI / HR</small><b>1.620 / 2.000 m</b></div>
        <div class="hud-note">Punto P-104 · prisma 0 mm · valores demostrativos hasta incorporar mediciones reales de proyectos.</div>
      </div>
    </section>`);
}

const form = document.getElementById('quoteForm');
const status = document.getElementById('formStatus');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    ...data,
    source: 'website',
    createdAt: new Date().toISOString(),
    page: location.href,
    professionalName: cfg.professionalName || ''
  };

  if (!cfg.n8nWebhookUrl) {
    status.textContent = 'Modo demostración: la automatización n8n aún no está conectada.';
    return;
  }

  status.textContent = 'Enviando…';
  try {
    const response = await fetch(cfg.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    form.reset();
    status.textContent = 'Solicitud recibida correctamente.';
  } catch (error) {
    status.textContent = 'No fue posible enviar la solicitud. Intenta nuevamente.';
    console.error(error);
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=10').catch(() => {}));
}
